import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Next production build emits the Circle homepage with metadata and JavaScript", async () => {
  const html=await readFile(new URL("../.next/server/app/index.html",import.meta.url),"utf8");
  assert.match(html,/<!DOCTYPE html>/i);
  assert.match(html,/<title>Veyro Circle/);
  assert.match(html,/<meta name="description" content="Lån, lej og del/);
  assert.match(html,/<script[^>]+src="\/_next\/static\//);
  assert.doesNotMatch(html,/codex-preview/);
});
