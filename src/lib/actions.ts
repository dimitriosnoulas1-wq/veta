"use server";

import { randomBytes, randomInt } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { generateSecret, generateURI, verifySync } from "otplib";
import type { PlanCode, ProductKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addInterval, dueNow, requireAdmin, requireUser } from "@/lib/data";
import { sameHex, signValue, validCaptcha } from "@/lib/captcha";
import { AD_PACKS, REPLAY_CENTS, WITHDRAW_DAILY_LIMIT_CENTS, WITHDRAW_FEE_CENTS } from "@/content/catalog";

function loc(form: FormData) {
  const value = String(form.get("locale") ?? "en");
  return value === "el" || value === "nl" ? value : "en";
}

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function go(locale: string, href: string, code?: string): never {
  revalidatePath("/", "layout");
  const join = href.includes("?") ? "&" : "?";
  redirect(code ? `/${locale}${href}${join}m=${code}` : `/${locale}${href}`);
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPlan(value: string): value is PlanCode {
  return value === "BASIC" || value === "PRO" || value === "ELITE" || value === "VIP";
}

function captchaOk(form: FormData) {
  return validCaptcha(field(form, "a"), field(form, "b"), field(form, "sig"), field(form, "answer"));
}

export async function registerMember(form: FormData) {
  const locale = loc(form);
  if (!captchaOk(form)) go(locale, "/register", "captchaFail");
  if (field(form, "terms") !== "yes") go(locale, "/register", "termsRequired");
  const email = field(form, "email").toLowerCase();
  const username = field(form, "username");
  const password = field(form, "password");
  const confirm = field(form, "confirm");
  if (!emailOk(email)) go(locale, "/register", "emailBad");
  if (!/^[a-z0-9]{3,32}$/i.test(username)) go(locale, "/register", "userBad");
  if (password.length < 8) go(locale, "/register", "short");
  if (password !== confirm) go(locale, "/register", "mismatch");
  if (!field(form, "firstName") || !field(form, "lastName")) go(locale, "/register", "formError");
  try {
    await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: await bcrypt.hash(password, 10),
        firstName: field(form, "firstName"),
        lastName: field(form, "lastName"),
        phone: field(form, "phone"),
        country: field(form, "country"),
        sponsorUsername: field(form, "sponsor") || null,
        language: locale,
        notifications: { create: {} },
        messengers: { create: {} },
      },
    });
  } catch {
    go(locale, "/register", "taken");
  }
  go(locale, "/login", "registered");
}

export async function sendContact(form: FormData) {
  const locale = loc(form);
  if (!captchaOk(form)) go(locale, "/contact", "captchaFail");
  const email = field(form, "email").toLowerCase();
  if (!field(form, "name") || !emailOk(email) || !field(form, "subject") || !field(form, "message")) {
    go(locale, "/contact", "formError");
  }
  await prisma.contactMessage.create({
    data: {
      name: field(form, "name"),
      email,
      department: field(form, "department") === "Sales" ? "Sales" : "Support",
      subject: field(form, "subject"),
      body: field(form, "message"),
    },
  });
  go(locale, "/contact", "contactSent");
}

export async function saveProfile(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const email = field(form, "email").toLowerCase();
  if (!emailOk(email) || !field(form, "firstName") || !field(form, "lastName")) go(locale, "/app/account", "formError");
  const language = field(form, "language");
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: field(form, "firstName"),
        lastName: field(form, "lastName"),
        email,
        phone: field(form, "phone"),
        country: field(form, "country"),
        language: language === "el" || language === "nl" ? language : "en",
      },
    });
  } catch {
    go(locale, "/app/account", "taken");
  }
  go(locale, "/app/account", "saved");
}

export async function changePassword(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const next = field(form, "next");
  if (next.length < 8 || next !== field(form, "confirm")) go(locale, "/app/account", "mismatch");
  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record?.passwordHash || !(await bcrypt.compare(field(form, "old"), record.passwordHash))) {
    go(locale, "/app/account", "authFail");
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  go(locale, "/app/account", "passwordChanged");
}

export async function savePhoto(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const file = form.get("photo");
  if (!(file instanceof File)) go(locale, "/app/account", "photoBad");
  const allowed = new Set(["image/jpeg", "image/png", "image/gif"]);
  if (!allowed.has(file.type) || file.size > 100 * 1024 || file.size === 0) go(locale, "/app/account", "photoBad");
  const ext = file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : "jpg";
  const dir = path.join(process.cwd(), "data", "avatars");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${user.id}.${ext}`), Buffer.from(await file.arrayBuffer()));
  await prisma.user.update({ where: { id: user.id }, data: { avatarUpdatedAt: new Date() } });
  go(locale, "/app/account", "photoOk");
}

export async function saveMessengers(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const data = {
    telegram: field(form, "telegram"),
    whatsapp: field(form, "whatsapp"),
    wechat: field(form, "wechat"),
    hangouts: field(form, "hangouts"),
    viber: field(form, "viber"),
    line: field(form, "line"),
    band: field(form, "band"),
    snapchat: field(form, "snapchat"),
    discord: field(form, "discord"),
    slack: field(form, "slack"),
    kik: field(form, "kik"),
    kakaotalk: field(form, "kakaotalk"),
    messenger: field(form, "messenger"),
  };
  await prisma.messenger.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
  go(locale, "/app/account", "saved");
}

export async function saveSettings(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  await prisma.user.update({ where: { id: user.id }, data: { autoRenew: field(form, "autoRenew") === "yes" } });
  const data = {
    loginAttempt: form.get("loginAttempt") === "on",
    rewards: form.get("rewards") === "on",
    withdrawal: form.get("withdrawal") === "on",
    customerUpgrades: form.get("customerUpgrades") === "on",
    prospect: form.get("prospect") === "on",
    commission: form.get("commission") === "on",
    admin: form.get("admin") === "on",
  };
  await prisma.notificationPrefs.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
  go(locale, "/app/account", "saved");
}

export async function saveTestimony(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const subject = field(form, "subject");
  const body = field(form, "body");
  if (!subject && !body) {
    await prisma.testimonial.deleteMany({ where: { userId: user.id } });
  } else {
    await prisma.testimonial.upsert({
      where: { userId: user.id },
      update: { subject, body },
      create: { userId: user.id, subject, body },
    });
  }
  go(locale, "/app/account", "saved");
}

export async function beginTotp(_prev: { secret?: string; qr?: string; error?: string } | null, form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const secret = generateSecret();
  const sig = signValue(secret);
  cookies().set("vl_totp", `${secret}.${sig}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  const uri = generateURI({ issuer: "VateLife", label: user.email, secret });
  const qr = await QRCode.toDataURL(uri);
  return { secret, qr };
}

export async function confirmTotp(_prev: { ok?: boolean; error?: string } | null, form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const raw = cookies().get("vl_totp")?.value ?? "";
  const secret = raw.slice(0, raw.lastIndexOf("."));
  const sig = raw.slice(raw.lastIndexOf(".") + 1);
  const token = field(form, "code").replace(/\s/g, "");
  if (!secret || !sameHex(sig, signValue(secret)) || !verifySync({ secret, token }).valid) {
    return { error: "totpBad" };
  }
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret, totpEnabled: true } });
  cookies().delete("vl_totp");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function disableTotp(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const record = await prisma.user.findUnique({ where: { id: user.id } });
  const token = field(form, "code").replace(/\s/g, "");
  if (!record?.totpSecret || !verifySync({ secret: record.totpSecret, token }).valid) go(locale, "/app/account", "totpBad");
  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: false, totpSecret: null } });
  go(locale, "/app/account", "twoFactorOff");
}

async function pay(userId: string, amountCents: number, method: string, description: string) {
  const crypto = method === "crypto";
  if (!crypto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.balanceCents < amountCents) return "insufficient" as const;
    await prisma.user.update({ where: { id: userId }, data: { balanceCents: { decrement: amountCents } } });
  }
  await prisma.payment.create({
    data: {
      userId,
      amountCents,
      method: crypto ? "CRYPTO" : "BALANCE",
      status: crypto ? "PENDING" : "PAID",
      description,
    },
  });
  return crypto ? "pending" as const : "paid" as const;
}

export async function upgradePlan(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const code = field(form, "plan");
  if (!isPlan(code)) go(locale, "/pricing", "planMissing");
  const plan = await prisma.plan.findUnique({ where: { code } });
  if (!plan) go(locale, "/pricing", "planMissing");
  const amount = dueNow(plan);
  const result = await pay(user.id, amount, field(form, "method"), `PLAN:${plan.code} Membership upgrade ( ${plan.name} )`);
  if (result === "insufficient") go(locale, `/app/upgrade?plan=${plan.code}`, "insufficient");
  if (result === "paid") {
    await prisma.user.update({
      where: { id: user.id },
      data: { planCode: plan.code, status: "PAID", activeUntil: addInterval(plan.interval) },
    });
    go(locale, "/app", "renewed");
  }
  await prisma.user.update({ where: { id: user.id }, data: { status: user.status === "PAID" ? "PAID" : "PAID_PENDING" } });
  go(locale, `/app/upgrade?plan=${plan.code}`, "pendingCrypto");
}

export async function buyReplay(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const result = await pay(user.id, REPLAY_CENTS, field(form, "method"), "REPLAY Live Coaching replays");
  if (result === "insufficient") go(locale, "/app/coaching", "insufficient");
  if (result === "paid") {
    await prisma.user.update({ where: { id: user.id }, data: { replayUntil: addInterval("year") } });
    go(locale, "/app/coaching", "renewed");
  }
  go(locale, "/app/coaching", "pendingCrypto");
}

export async function buyVoucher(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const code = field(form, "plan");
  if (!isPlan(code)) go(locale, "/app/wallet/vouchers", "planMissing");
  const plan = await prisma.plan.findUnique({ where: { code } });
  if (!plan) go(locale, "/app/wallet/vouchers", "planMissing");
  const result = await pay(user.id, plan.voucherCents, field(form, "method"), `VOUCHER:${plan.code}`);
  if (result === "insufficient") go(locale, "/app/wallet/vouchers", "insufficient");
  if (result === "paid") {
    await prisma.voucher.create({ data: { userId: user.id, planCode: plan.code, code: randomBytes(4).toString("hex") } });
    go(locale, "/app/wallet/mine", "voucherIssued");
  }
  go(locale, "/app/wallet/vouchers", "pendingCrypto");
}

export async function buyAirtime(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const pack = AD_PACKS.find((item) => item.id === field(form, "pack"));
  if (!pack) go(locale, "/app/ads/buy", "formError");
  const result = await pay(user.id, pack.cents, field(form, "method"), `ADS:${pack.id} ${pack.name}`);
  if (result === "insufficient") go(locale, "/app/ads/buy", "insufficient");
  if (result === "paid") {
    await prisma.user.update({ where: { id: user.id }, data: { adCredits: { increment: pack.credits } } });
    go(locale, "/app/ads/history", "saved");
  }
  go(locale, "/app/ads/buy", "pendingCrypto");
}

export async function savePayout(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const label = field(form, "label");
  if (!label) go(locale, "/app/wallet/account", "formError");
  await prisma.payoutAccount.upsert({ where: { userId: user.id }, update: { label }, create: { userId: user.id, label } });
  go(locale, "/app/wallet/account", "payoutSaved");
}

export async function makeWithdrawCode(_prev: { code?: string } | null, form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const code = String(randomInt(100000, 999999));
  const sig = signValue(`${user.id}:${code}`);
  cookies().set("vl_wd", `${code}.${sig}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return { code };
}

export async function requestWithdrawal(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  if (!user.payout) go(locale, "/app/wallet/withdraw", "withdrawBlocked");
  const raw = cookies().get("vl_wd")?.value ?? "";
  const code = raw.slice(0, raw.lastIndexOf("."));
  const sig = raw.slice(raw.lastIndexOf(".") + 1);
  if (!code || field(form, "code") !== code || !sameHex(sig, signValue(`${user.id}:${code}`))) {
    go(locale, "/app/wallet/withdraw", "needCode");
  }
  const amountCents = Math.round(Number(field(form, "amount")) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) go(locale, "/app/wallet/withdraw", "formError");
  if (amountCents > WITHDRAW_DAILY_LIMIT_CENTS) go(locale, "/app/wallet/withdraw", "dailyLimit");
  const total = amountCents + WITHDRAW_FEE_CENTS;
  if (user.balanceCents < total) go(locale, "/app/wallet/withdraw", "insufficient");
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        balanceCents: { decrement: total },
        pendingWithdrawalCents: { increment: amountCents },
      },
    }),
    prisma.withdrawal.create({ data: { userId: user.id, amountCents, status: "PENDING" } }),
  ]);
  cookies().delete("vl_wd");
  go(locale, "/app/wallet/payouts", "withdrawOk");
}

export async function saveAddress(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  if (!field(form, "line") || !field(form, "city") || !field(form, "country")) go(locale, "/app/shop/cart", "formError");
  await prisma.address.create({
    data: {
      userId: user.id,
      name: field(form, "name") || `${user.firstName} ${user.lastName}`.trim(),
      receiver: field(form, "receiver") || field(form, "name"),
      phone: field(form, "phone"),
      line: field(form, "line"),
      city: field(form, "city"),
      state: field(form, "state"),
      country: field(form, "country"),
      postal: field(form, "postal"),
    },
  });
  go(locale, "/app/shop/cart", "shippingSaved");
}

export async function addToCart(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const productId = field(form, "productId");
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) go(locale, "/app/shop", "formError");
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { qty: { increment: 1 } },
    create: { userId: user.id, productId, qty: 1 },
  });
  go(locale, "/app/shop/cart", "saved");
}

export async function updateCart(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const id = field(form, "id");
  if (field(form, "op") === "remove") {
    await prisma.cartItem.deleteMany({ where: { id, userId: user.id } });
  }
  go(locale, "/app/shop/cart", "saved");
}

export async function checkout(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  if (!items.length) go(locale, "/app/shop/cart", "emptyCart");
  if (items.some((item) => item.product.kind === "PHYSICAL")) {
    const address = await prisma.address.findFirst({ where: { userId: user.id } });
    if (!address) go(locale, "/app/shop/cart", "addressNeeded");
  }
  const total = items.reduce((sum, item) => sum + item.product.memberCents * item.qty, 0);
  const order = await prisma.order.create({
    data: {
      number: `VL${Date.now().toString(36)}`,
      userId: user.id,
      totalCents: total,
      memberCents: total,
      status: "Pending",
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          title: item.product.title,
          qty: item.qty,
          memberCents: item.product.memberCents,
        })),
      },
    },
  });
  const result = await pay(user.id, total, field(form, "method"), `ORDER:${order.id}`);
  if (result === "insufficient") {
    await prisma.order.delete({ where: { id: order.id } });
    go(locale, "/app/shop/cart", "insufficient");
  }
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  if (result === "paid") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "Paid" } });
    go(locale, "/app/shop/history", "orderPlaced");
  }
  go(locale, "/app/shop/history", "orderPending");
}

export async function createAd(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const kind = field(form, "kind") === "banner" ? "banner" : "text";
  const impressions = Math.round(Number(field(form, "credits")));
  const per = kind === "banner" ? 2 : 1;
  if (!Number.isFinite(impressions) || impressions <= 0 || !field(form, "name") || !field(form, "url")) {
    go(locale, kind === "banner" ? "/app/ads/banner" : "/app/ads/text", "formError");
  }
  const cost = impressions * per;
  if (user.adCredits < cost) go(locale, kind === "banner" ? "/app/ads/banner" : "/app/ads/text", "adNeed");
  let imagePath = "";
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > 1024 * 1024) go(locale, "/app/ads/banner", "formError");
    const dir = path.join(process.cwd(), "data", "ads");
    await mkdir(dir, { recursive: true });
    imagePath = `${user.id}-${Date.now()}`;
    await writeFile(path.join(dir, imagePath), Buffer.from(await file.arrayBuffer()));
  }
  await prisma.$transaction([
    prisma.ad.create({
      data: {
        userId: user.id,
        kind,
        name: field(form, "name"),
        title: field(form, "title"),
        line1: field(form, "line1"),
        line2: field(form, "line2"),
        url: field(form, "url"),
        size: field(form, "size"),
        imagePath,
        credits: cost,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { adCredits: { decrement: cost } } }),
  ]);
  go(locale, kind === "banner" ? "/app/ads/banner" : "/app/ads/text", "adSaved");
}

export async function toggleLesson(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  const lessonId = field(form, "lessonId");
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
  if (!lesson) go(locale, "/app", "formError");
  const { canAccess } = await import("@/lib/access");
  const access = lesson.course.access === "pro" || lesson.course.access === "elite" || lesson.course.access === "vip" ? lesson.course.access : "open";
  if (!canAccess(user.planCode, access)) go(locale, `/app/learn/${lesson.course.academy}/${lesson.course.id}`, "error");
  const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } } });
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed: !existing?.completed },
    create: { userId: user.id, lessonId, completed: true },
  });
  go(locale, `/app/learn/${lesson.course.academy}/${lesson.course.id}`, "saved");
}

export async function openTicket(form: FormData) {
  const locale = loc(form);
  const user = await requireUser(locale);
  if (!captchaOk(form)) go(locale, "/app/support/new", "captchaFail");
  const subject = field(form, "subject");
  const body = field(form, "message");
  if (!subject || !body) go(locale, "/app/support/new", "formError");
  const number = String(randomInt(10000000, 99999999));
  await prisma.ticket.create({
    data: {
      number,
      userId: user.id,
      department: field(form, "department") === "Sales" ? "Sales" : "Support",
      subject,
      messages: { create: { author: "member", body } },
    },
  });
  go(locale, "/app/support/open", "ticketSent");
}

export async function saveCourse(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const id = field(form, "id");
  const access = field(form, "access");
  await prisma.course.update({
    where: { id },
    data: {
      title: field(form, "title"),
      summary: field(form, "summary"),
      access: access === "pro" || access === "elite" || access === "vip" ? access : "open",
    },
  });
  go(locale, "/admin/courses", "adminSaved");
}

export async function addLesson(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const courseId = field(form, "courseId");
  const count = await prisma.lesson.count({ where: { courseId } });
  await prisma.lesson.create({
    data: {
      courseId,
      position: count + 1,
      title: field(form, "title") || `Module ${count + 1}`,
      videoId: field(form, "videoId") || null,
      note: "",
    },
  });
  go(locale, "/admin/courses", "lessonAdded");
}

export async function saveProduct(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const kind = field(form, "kind");
  const data = {
    title: field(form, "title"),
    category: field(form, "category"),
    priceCents: Number(field(form, "priceCents")) || 0,
    wasCents: Number(field(form, "wasCents")) || 0,
    memberCents: Number(field(form, "memberCents")) || 0,
    detail: field(form, "detail"),
    kind: (kind === "PHYSICAL" || kind === "OFFER" ? kind : "EBOOK") as ProductKind,
  };
  const id = field(form, "id");
  if (id) await prisma.product.update({ where: { id }, data });
  else await prisma.product.create({ data: { id: field(form, "newId") || `product-${Date.now()}`, ...data } });
  go(locale, "/admin/products", "adminSaved");
}

export async function savePlan(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const code = field(form, "code");
  if (!isPlan(code)) go(locale, "/admin/plans", "formError");
  const num = (key: string) => Number(field(form, key)) || 0;
  await prisma.plan.update({
    where: { code },
    data: {
      enrollmentCents: num("enrollmentCents"),
      recurringCents: num("recurringCents"),
      leads: num("leads"),
      leadsOnRenewal: num("leadsOnRenewal"),
      impressions: num("impressions"),
      impressionsOnRenewal: num("impressionsOnRenewal"),
      softwares: num("softwares"),
      voucherCents: num("voucherCents"),
      directCommissionCents: num("directCommissionCents"),
      matrixDepth: num("matrixDepth"),
      teamLeadLevels: num("teamLeadLevels"),
      giftProducts: num("giftProducts"),
      waCast: form.get("waCast") === "on",
      tgCast: form.get("tgCast") === "on",
      leadsCatcher: form.get("leadsCatcher") === "on",
      metaWa: form.get("metaWa") === "on",
    },
  });
  go(locale, "/admin/plans", "adminSaved");
}

export async function saveUser(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const id = field(form, "id");
  const plan = field(form, "planCode");
  const status = field(form, "status");
  const role = field(form, "role");
  await prisma.user.update({
    where: { id },
    data: {
      planCode: isPlan(plan) ? plan : null,
      status: status === "PAID" || status === "PAID_PENDING" || status === "EXPIRED" ? status : "FREE",
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      balanceCents: Number(field(form, "balanceCents")) || 0,
      adCredits: Number(field(form, "adCredits")) || 0,
    },
  });
  go(locale, "/admin/users", "adminSaved");
}

export async function markPayment(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const payment = await prisma.payment.findUnique({ where: { id: field(form, "id") } });
  if (!payment || payment.status === "PAID") go(locale, "/admin", "noPending");
  await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID" } });
  if (payment.description.startsWith("PLAN:")) {
    const code = payment.description.slice(5).split(" ")[0];
    if (isPlan(code)) {
      const plan = await prisma.plan.findUnique({ where: { code } });
      if (plan) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { planCode: code, status: "PAID", activeUntil: addInterval(plan.interval) },
        });
      }
    }
  } else if (payment.description.startsWith("REPLAY")) {
    await prisma.user.update({ where: { id: payment.userId }, data: { replayUntil: addInterval("year") } });
  } else if (payment.description.startsWith("ADS:")) {
    const id = payment.description.slice(4).split(" ")[0];
    const pack = AD_PACKS.find((item) => item.id === id);
    if (pack) await prisma.user.update({ where: { id: payment.userId }, data: { adCredits: { increment: pack.credits } } });
  } else if (payment.description.startsWith("VOUCHER:")) {
    const code = payment.description.slice(8).split(" ")[0];
    if (isPlan(code)) {
      await prisma.voucher.create({ data: { userId: payment.userId, planCode: code, code: randomBytes(4).toString("hex") } });
    }
  } else if (payment.description.startsWith("ORDER:")) {
    const id = payment.description.slice(6).split(" ")[0];
    await prisma.order.updateMany({ where: { id, userId: payment.userId }, data: { status: "Paid" } });
  }
  go(locale, "/admin", "adminSaved");
}

export async function replyTicket(form: FormData) {
  const locale = loc(form);
  const admin = await requireAdmin(locale);
  void admin;
  const ticket = await prisma.ticket.findUnique({ where: { id: field(form, "id") } });
  if (!ticket || ticket.status === "CLOSED") go(locale, "/admin/tickets", "closedNoReply");
  const body = field(form, "body");
  if (!body) go(locale, "/admin/tickets", "formError");
  await prisma.ticketMessage.create({ data: { ticketId: ticket.id, author: "staff", body } });
  if (field(form, "close") === "yes") await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "CLOSED" } });
  go(locale, "/admin/tickets", "adminSaved");
}

export async function addLibrary(form: FormData) {
  const locale = loc(form);
  await requireAdmin(locale);
  const kind = field(form, "kind");
  if (kind === "faq") {
    await prisma.faq.create({ data: { category: field(form, "category") || "General", question: field(form, "question"), answer: field(form, "answer") } });
  } else if (kind === "news") {
    await prisma.newsItem.create({ data: { title: field(form, "title"), body: field(form, "body") } });
  } else if (kind === "article") {
    await prisma.article.create({ data: { title: field(form, "title"), body: field(form, "body") } });
  } else {
    await prisma.calendarEvent.create({ data: { title: field(form, "title"), when: field(form, "when"), href: field(form, "href"), note: field(form, "note") } });
  }
  go(locale, "/admin/library", "adminSaved");
}
