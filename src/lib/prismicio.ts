/**
 * Prismic Client Configuration
 * 
 * Centralized setup for Prismic CMS integration with Next.js
 * Handles environment detection, caching, and preview mode
 */

import {
  createClient as baseCreateClient,
  type ClientConfig,
  type Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../../slicemachine.config.json";

/**
 * Repository name - uses environment variable or falls back to config
 * Allows switching between staging/production Prismic repos
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * Route resolver configuration
 * Maps Prismic document types to URL paths
 * Add routes here as you create new page types
 */
const routes: Route[] = [
  // Example routes:
  // { type: "homepage", path: "/" },
  // { type: "page", path: "/:uid" },
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
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }  // Production: cache forever
        : { next: { revalidate: 5 } },                           // Development: revalidate every 5s
    ...config,
  });

  // Enable preview mode for draft content
  enableAutoPreviews({ client });

  return client;
};


