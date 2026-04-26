// RFC 8785 JSON Canonicalization Scheme (subset). Pure, deterministic.

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`canonicalJson: non-finite number ${value}`);
    }
    return formatNumber(value);
  }
  if (typeof value === "string") return formatString(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return "{" + keys.map(k => formatString(k) + ":" + canonicalJson(obj[k])).join(",") + "}";
  }
  throw new Error(`canonicalJson: unsupported value type ${typeof value}`);
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toString();
}

function formatString(s: string): string {
  let out = "\"";
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (ch === "\"")      out += "\\\"";
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\b") out += "\\b";
    else if (ch === "\f") out += "\\f";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (code < 0x20) out += "\\u" + code.toString(16).padStart(4, "0");
    else                  out += ch;
  }
  return out + "\"";
}
