import assert from "node:assert/strict";
import test from "node:test";
import { canAccess } from "./access";
import { safeCallback } from "./format";
import { AD_PACKS, PLANS, REPLAY_CENTS } from "../content/catalog";
import { messages as en } from "../messages/en";
import { messages as el } from "../messages/el";
import { messages as nl } from "../messages/nl";

test("plan locks follow the recorded access rules", () => {
  assert.equal(canAccess(null, "open"), false);
  assert.equal(canAccess("BASIC", "open"), true);
  assert.equal(canAccess("BASIC", "pro"), false);
  assert.equal(canAccess("PRO", "pro"), true);
  assert.equal(canAccess("PRO", "elite"), false);
  assert.equal(canAccess("ELITE", "elite"), true);
  assert.equal(canAccess("ELITE", "vip"), false);
  assert.equal(canAccess("VIP", "vip"), true);
});

test("prices come from the public pricing table", () => {
  const basic = PLANS.find((plan) => plan.code === "BASIC");
  const vip = PLANS.find((plan) => plan.code === "VIP");
  assert.ok(basic && vip);
  assert.equal(basic.enrollmentCents, 1300);
  assert.equal(basic.recurringCents, 1200);
  assert.equal(vip.enrollmentCents, 0);
  assert.equal(vip.recurringCents, 50000);
  assert.equal(vip.interval, "year");
  assert.equal(vip.leadsOnRenewal, 1000);
  assert.equal(vip.softwares, 5);
  assert.equal(REPLAY_CENTS, 2000);
  assert.deepEqual(AD_PACKS.map((pack) => [pack.credits, pack.cents]), [[2500, 2000], [6500, 5000], [15000, 10000]]);
});

function leaves(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, `${prefix}${key}.`));
  }
  return [prefix];
}

test("login returns only to a local page", () => {
  assert.equal(safeCallback("en", undefined), "/en/app");
  assert.equal(safeCallback("en", "/en/app/upgrade?plan=PRO"), "/en/app/upgrade?plan=PRO");
  assert.equal(safeCallback("el", "https://evil.example/phish"), "/el/app");
  assert.equal(safeCallback("nl", "//evil.example"), "/nl/app");
  assert.equal(safeCallback("en", "/%2f%2fevil.example"), "/en/app");
});

test("Greek and Dutch cover the same interface strings", () => {
  assert.deepEqual(leaves(el), leaves(en));
  assert.deepEqual(leaves(nl), leaves(en));
  assert.notEqual(el.chrome.empty, en.chrome.empty);
  assert.notEqual(nl.chrome.empty, en.chrome.empty);
  assert.equal(el.nav.pricing, "Pricing");
});
