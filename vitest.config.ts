import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Unit and API tests never touch the network: Prismic reads come from
    // src/fixtures and Stripe calls are stubbed per test.
    env: {
      PRISMIC_FIXTURES: "1",
      NEXT_PUBLIC_SITE_URL: "http://localhost:4311",
      STRIPE_SECRET_KEY: "",
      PRISMIC_WEBHOOK_SECRET: "",
    },
  },
});
