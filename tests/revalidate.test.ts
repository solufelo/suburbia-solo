import { afterEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag: (tag: string) => revalidateTag(tag) }));

const { POST } = await import("@/app/api/revalidate/route");

const call = (body: unknown) =>
  POST(new Request("http://localhost/api/revalidate", { method: "POST", body: JSON.stringify(body) }));

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTag.mockClear();
});

describe("POST /api/revalidate", () => {
  it("is closed when no webhook secret is configured", async () => {
    const res = await call({ secret: "" });
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a wrong or missing secret", async () => {
    vi.stubEnv("PRISMIC_WEBHOOK_SECRET", "s3cret-value");
    expect((await call({ secret: "nope" })).status).toBe(401);
    expect((await call({})).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates Prismic content with the right secret", async () => {
    vi.stubEnv("PRISMIC_WEBHOOK_SECRET", "s3cret-value");
    const res = await call({ secret: "s3cret-value", type: "api-update" });
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("prismic");
  });
});
