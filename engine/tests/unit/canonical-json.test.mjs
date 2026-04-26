import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJson } from "../../dist/canonical-json.js";

test("primitives", () => {
  assert.equal(canonicalJson(null),    "null");
  assert.equal(canonicalJson(true),    "true");
  assert.equal(canonicalJson(false),   "false");
  assert.equal(canonicalJson(0),       "0");
  assert.equal(canonicalJson(-1.5),    "-1.5");
  assert.equal(canonicalJson("hello"), "\"hello\"");
});

test("sorts object keys", () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
  assert.equal(canonicalJson({ z: { y: 1, x: 2 }, a: 3 }), '{"a":3,"z":{"x":2,"y":1}}');
});

test("preserves array order", () => {
  assert.equal(canonicalJson([3, 1, 2]), "[3,1,2]");
});

test("no whitespace", () => {
  assert.equal(canonicalJson({ a: [1, 2], b: { c: 3 } }), '{"a":[1,2],"b":{"c":3}}');
});

test("integer formatting (RFC 8785: no trailing zero, no plus)", () => {
  assert.equal(canonicalJson(1.0),  "1");
  assert.equal(canonicalJson(1.5),  "1.5");
  assert.equal(canonicalJson(1e3),  "1000");
});

test("string escapes", () => {
  assert.equal(canonicalJson("a\"b"),  '"a\\"b"');
  assert.equal(canonicalJson("a\\b"),  '"a\\\\b"');
  assert.equal(canonicalJson("a\nb"),  '"a\\nb"');
  assert.equal(canonicalJson("a\tb"),  '"a\\tb"');
});

test("rejects non-finite numbers", () => {
  assert.throws(() => canonicalJson(NaN),       /finite/i);
  assert.throws(() => canonicalJson(Infinity),  /finite/i);
  assert.throws(() => canonicalJson(-Infinity), /finite/i);
});

test("rejects undefined and functions", () => {
  assert.throws(() => canonicalJson(undefined),  /unsupported/i);
  assert.throws(() => canonicalJson(() => null), /unsupported/i);
});
