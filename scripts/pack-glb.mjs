// Packs assets/model/skateboard.gltf + skateboard.bin into a single binary
// public/skateboard.glb (one request instead of two, and no bare ".bin" URL,
// which some network filters block or rewrite).
//
//   node scripts/pack-glb.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(root, "assets", "model");
const gltf = JSON.parse(readFileSync(resolve(src, "skateboard.gltf"), "utf8"));
const bin = readFileSync(resolve(src, gltf.buffers[0].uri));

if (gltf.buffers.length !== 1) throw new Error("expected exactly one buffer");
delete gltf.buffers[0].uri;
gltf.buffers[0].byteLength = bin.length;

const pad = (buf, fill) => {
  const extra = (4 - (buf.length % 4)) % 4;
  return extra ? Buffer.concat([buf, Buffer.alloc(extra, fill)]) : buf;
};

const json = pad(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
const data = pad(bin, 0);
const total = 12 + 8 + json.length + 8 + data.length;

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); // "glTF"
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);

const chunk = (type, body) => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(body.length, 0);
  h.writeUInt32LE(type, 4);
  return Buffer.concat([h, body]);
};

writeFileSync(
  resolve(root, "public", "skateboard.glb"),
  Buffer.concat([header, chunk(0x4e4f534a, json), chunk(0x004e4942, data)]),
);
console.log(`wrote public/skateboard.glb (${total} bytes)`);
