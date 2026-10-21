/**
 * Prismic Client Configuration
 *
 * Centralized setup for Prismic CMS integration with Next.js
 * Handles environment detection, caching, preview mode and the local fixture
 * fallback (see ./prismic-fixtures.ts).
 */

import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../../slicemachine.config.json";
import { fixtureFetch, resilientFetch } from "./prismic-fixtures";

/**
 * Repository name - uses environment variable or falls back to config
 * Allows switching between staging/production Prismic repos
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/** True when the site reads content from src/fixtures instead of Prismic. */
export const usingFixtures = process.env.PRISMIC_FIXTURES === "1";

/**
 * Route resolver configuration
 * Maps Prismic document types to URL paths
 */
const routes: Route[] = [
  { type: "homepage", path: "/" },
  { type: "skateboard", path: "/boards/:uid" },
];

/**
 * Creates a configured Prismic client
 *
 * @param config - Optional client configuration overrides
 * @returns Configured Prismic client with caching and preview support
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = baseCreateClient(repositoryName, {
    routes,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
    fetch: usingFixtures ? fixtureFetch : resilientFetch,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" } // Production: cache until revalidated
        : { next: { revalidate: 5 } }, // Development: revalidate every 5s
    ...config,
  });

  // Enable preview mode for draft content
  if (!usingFixtures) enableAutoPreviews({ client });

  return client;
};
