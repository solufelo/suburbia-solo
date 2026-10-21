/**
 * A tiny stand-in for the Prismic REST API, backed by
 * src/fixtures/prismic-documents.json (refresh it with
 * `node scripts/snapshot-prismic.mjs`).
 *
 * Plugged into the Prismic client as its `fetch`, so every page keeps using
 * the normal client API. Used when PRISMIC_FIXTURES=1 (tests, offline work,
 * no repository access) and as a fallback when the live API is unreachable.
 *
 * Images are rewritten from the Prismic CDN to web-sized copies in
 * public/Images/web (scripts/build-web-images.py) so fixture mode does not
 * depend on Prismic at all and does not ship the full-size source PNGs.
 */
import snapshot from "@/fixtures/prismic-documents.json";

type Doc = { id: string; uid: string | null; type: string; [key: string]: unknown };

const FIXTURE_REF = "fixture-master";

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
}

let documents: Doc[] | null = null;

function loadDocuments(): Doc[] {
  if (documents) return documents;
  const origin = siteOrigin();
  const json = JSON.stringify(snapshot.documents).replace(
    /https:\/\/images\.prismic\.io\/[\w-]+\/[\w-]+?_([^"?]+\.(?:png|jpe?g|webp|avif|gif|svg))(\?[^"]*)?/g,
    // Web-sized WebP copies made by scripts/build-web-images.py.
    (_match, file: string) => `${origin}/Images/web/${file.replace(/\.[a-z]+$/i, "")}.webp`,
  );
  documents = JSON.parse(json) as Doc[];
  return documents;
}

// One predicate: at(path, "value") or in/any(path, ["a", "b"]).
const PREDICATE = /(at|in|any)\(\s*([\w.]+)\s*,\s*("[^"]*"|\[[^\]]*\])\s*\)/g;

function fieldValue(doc: Doc, path: string): string | null {
  if (path === "document.type") return doc.type;
  if (path === "document.id") return doc.id;
  const uid = path.match(/^my\.([\w-]+)\.uid$/);
  if (uid) return doc.type === uid[1] ? doc.uid : null;
  return null;
}

/**
 * Turns a `q` value such as `[[at(document.type, "skater")]]` into a filter.
 * Returns null for anything this stub cannot evaluate, so a test fails loudly
 * instead of silently returning the wrong documents.
 */
function compileFilter(q: string): ((doc: Doc) => boolean) | null {
  const calls = [...q.matchAll(PREDICATE)];
  const names = q.match(/[a-z]+(?=\()/gi) ?? [];
  if (calls.length === 0 || names.length !== calls.length) return null;

  const tests = calls.map(([, op, path, raw]) => {
    const values =
      op === "at"
        ? [raw.slice(1, -1)]
        : raw
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""));
    if ((op === "at") !== raw.startsWith('"')) return null;
    return (doc: Doc) => {
      const value = fieldValue(doc, path);
      return value !== null && values.includes(value);
    };
  });
  if (tests.some((t) => t === null)) return null;
  return (doc) => tests.every((t) => t!(doc));
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function fixtureFetch(input: RequestInfo | URL): Promise<Response> {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);

  if (/\/api\/v2\/?$/.test(url.pathname)) {
    return json({
      refs: [{ id: "master", ref: FIXTURE_REF, label: "Master", isMasterRef: true }],
      integrationFieldsRef: null,
      types: {},
      languages: [{ id: "en-us", name: "English - United States", is_master: true }],
      tags: [],
      forms: {},
    });
  }

  if (url.pathname.endsWith("/api/v2/documents/search")) {
    let results = loadDocuments();
    for (const q of url.searchParams.getAll("q")) {
      const filter = compileFilter(q);
      if (!filter) {
        return json({ message: `Fixture API cannot evaluate filter ${q}` }, 400);
      }
      results = results.filter(filter);
    }
    const pageSize = Math.max(1, Number(url.searchParams.get("pageSize")) || 20);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
    const slice = results.slice((page - 1) * pageSize, page * pageSize);
    return json({
      page,
      results_per_page: pageSize,
      results_size: slice.length,
      total_results_size: results.length,
      total_pages: totalPages,
      next_page: page < totalPages ? `${url.origin}${url.pathname}?page=${page + 1}` : null,
      prev_page: null,
      results: slice,
    });
  }

  return json({ message: "Not found in fixtures" }, 404);
}

/** Live fetch that falls back to fixtures when the Prismic API is unreachable. */
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    console.warn(
      `[prismic] API unreachable (${(error as Error).message}); serving local fixtures instead.`,
    );
    return fixtureFetch(input);
  }
}
