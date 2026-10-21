import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 4311);

/**
 * Browser smoke test of the shop flow against a production build that reads
 * Prismic content from src/fixtures and uses the mock checkout, so it runs
 * offline and never touches Stripe.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      // Software WebGL so the 3D board renders on machines without a GPU.
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/boards`,
    timeout: 600_000,
    reuseExistingServer: true,
    env: {
      PRISMIC_FIXTURES: "1",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      NEXT_DIST_DIR: ".next-e2e",
      STRIPE_SECRET_KEY: "",
    },
  },
});
