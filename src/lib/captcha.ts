import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

function secret() {
  return process.env.NEXTAUTH_SECRET || "vatelife-dev";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createCaptcha() {
  const a = randomInt(2, 9);
  const b = randomInt(2, 9);
  return { a, b, sig: sign(`${a}+${b}`) };
}

export function signValue(value: string) {
  return sign(value);
}

export function sameHex(a: string, b: string) {
  return same(a, b);
}

export function validCaptcha(a: string, b: string, sig: string, answer: string) {
  if (!/^\d+$/.test(a) || !/^\d+$/.test(b) || !/^\d+$/.test(answer)) return false;
  if (!same(sig, sign(`${a}+${b}`))) return false;
  return Number(answer) === Number(a) + Number(b);
}
