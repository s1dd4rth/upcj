// Pure-function spec hash computer. Used by bundle-spec.mjs and CI.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function computeSpecHash(specRoot) {
  const files = listFiles(specRoot).sort();
  const hash = createHash("sha256");
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    // Canonicalise JSON files so reformatting whitespace doesn't change the hash.
    const normalised = file.endsWith(".json")
      ? canonicalJsonSerialise(JSON.parse(content))
      : content;
    hash.update(relative(specRoot, file));
    hash.update("\0");
    hash.update(normalised);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

function canonicalJsonSerialise(value) {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJsonSerialise).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalJsonSerialise(value[k])).join(",") + "}";
}
