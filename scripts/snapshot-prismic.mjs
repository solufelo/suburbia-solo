// Saves every published Prismic document to src/fixtures/prismic-documents.json.
// The site uses that file when PRISMIC_FIXTURES=1 or when the Prismic API
// cannot be reached, so it still runs offline and in tests.
//
//   node scripts/snapshot-prismic.mjs            (public repository)
//   PRISMIC_ACCESS_TOKEN=... node scripts/snapshot-prismic.mjs   (private one)
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sm = JSON.parse(readFileSync(resolve(root, "slicemachine.config.json"), "utf8"));
const repo = process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;
const token = process.env.PRISMIC_ACCESS_TOKEN;
const api = `https://${repo}.cdn.prismic.io/api/v2`;

const withToken = (url) => {
  if (token) url.searchParams.set("access_token", token);
  return url;
};

const meta = await (await fetch(withToken(new URL(api)))).json();
const ref = meta.refs.find((r) => r.isMasterRef).ref;

const results = [];
for (let page = 1; ; page++) {
  const url = withToken(new URL(`${api}/documents/search`));
  url.searchParams.set("ref", ref);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("page", String(page));
  const body = await (await fetch(url)).json();
  results.push(...body.results);
  if (!body.next_page) break;
}

results.sort((a, b) => (a.type + a.id).localeCompare(b.type + b.id));
const out = resolve(root, "src", "fixtures", "prismic-documents.json");
writeFileSync(out, JSON.stringify({ repository: repo, documents: results }, null, 2) + "\n");
console.log(`saved ${results.length} documents from ${repo}`);
