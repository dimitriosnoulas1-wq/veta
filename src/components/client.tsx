"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { signIn } from "next-auth/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { beginTotp, confirmTotp, disableTotp, makeWithdrawCode } from "@/lib/actions";

export function ThemeButton() {
  const t = useTranslations("chrome");
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.classList.contains("light")), []);
  return (
    <button
      type="button"
      className="btn btn-ghost"
      aria-label={t("theme")}
      onClick={() => {
        const next = !document.documentElement.classList.contains("light");
        document.documentElement.classList.toggle("light", next);
        localStorage.setItem("theme", next ? "light" : "dark");
        setLight(next);
      }}
    >
      {light ? t("dark") : t("light")}
    </button>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const t = useTranslations("chrome");
  const [done, setDone] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="flex flex-col gap-2 sm:flex-row">
        <input readOnly value={value} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setDone(true);
          }}
        >
          {done ? t("copied") : t("copy")}
        </button>
      </span>
    </label>
  );
}

export function Countdown({ target, stamp = "17/11/2026 06:29:40" }: { target: string; stamp?: string }) {
  const t = useTranslations("chrome");
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      const pad = (value: number) => String(value).padStart(2, "0");
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const minutes = Math.floor(diff / 60000) % 60;
      const seconds = Math.floor(diff / 1000) % 60;
      setText(`${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return (
    <div>
      <p className="text-sm text-muted">{t("countdownTo")} {stamp} EET</p>
      {text ? <p className="display text-4xl tabular-nums">{text}</p> : <div className="skeleton mt-2 h-10 w-72" />}
    </div>
  );
}

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const numeric = value.replace(/[^0-9.-]/g, "");
    const target = Number(numeric);
    if (!Number.isFinite(target) || Math.abs(target) > 1_000_000) {
      node.textContent = value;
      return;
    }
    const prefix = value.slice(0, value.indexOf(numeric));
    const suffix = value.slice(value.indexOf(numeric) + numeric.length);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.textContent = value;
      return;
    }
    const start = performance.now();
    const duration = 700;
    const from = 0;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = from + (target - from) * eased;
      const decimals = numeric.includes(".") ? (numeric.split(".")[1]?.length ?? 0) : 0;
      node.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

export function LockNotice({ label, detail, href, action, close }: { label: string; detail: string; href: string; action: string; close: string }) {
  return (
    <Dialog.Root>
      <div className="card grid gap-3 p-5">
        <p className="w-fit rounded-full bg-plum px-3 py-1 text-sm font-semibold text-[#fff8f1]">{label}</p>
        <p>{detail}</p>
        <Dialog.Trigger className="btn btn-primary w-fit">{action}</Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-[color:var(--card-solid)] p-6 text-ink shadow-glow">
          <Dialog.Title className="display text-3xl">{label}</Dialog.Title>
          <p className="mt-3">{detail}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="btn btn-primary" href={href} prefetch>{action}</Link>
            <Dialog.Close className="btn btn-ghost">{close}</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TeamTree({ you, sponsor, back, down, total, note }: { you: string; sponsor: string; back: string; down: string; total: string; note: string }) {
  const top = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<number | null>(null);
  return (
    <div ref={top} className="card grid gap-4 p-5">
      <p>{note}</p>
      <div className="flex flex-col items-center gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => setLevel(null)}>{sponsor}</button>
        <div className="h-6 w-px bg-line" />
        <button type="button" className="btn btn-plum" onClick={() => setLevel(null)}>{you}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Array.from({ length: 14 }, (_, index) => (
          <button key={index} type="button" className="btn btn-ghost" onClick={() => setLevel(index + 1)}>
            {down} {index + 1}: 0
          </button>
        ))}
      </div>
      <p>{total}: 0{level ? ` · ${down} ${level}: 0` : ""}</p>
      <button type="button" className="btn btn-primary w-fit" onClick={() => top.current?.scrollIntoView({ block: "start" })}>{back}</button>
    </div>
  );
}

export function LoginForm({ registered, callbackUrl }: { registered: boolean; callbackUrl: string }) {
  const t = useTranslations("chrome");
  const nav = useTranslations("nav");
  const [error, setError] = useState("");
  const [magic, setMagic] = useState("");
  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      totp: String(data.get("totp") ?? ""),
      redirect: false,
      callbackUrl,
    });
    if (result?.error) {
      const code = result.error;
      setError(code.includes("TOTP_REQUIRED") ? t("totpNeed") : code.includes("TOTP_INVALID") ? t("totpBad") : t("authFail"));
      return;
    }
    window.location.href = callbackUrl;
  }
  async function onMagic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await signIn("email", { email: String(data.get("email") ?? ""), redirect: false, callbackUrl });
    setMagic(t("magicSent"));
  }
  return (
    <div className="grid gap-6">
      {registered ? <p className="rounded-2xl border border-line bg-[color:var(--glass)] p-4 backdrop-blur-md">{t("registered")}</p> : null}
      <form className="card grid gap-3 p-5" onSubmit={onPassword} autoComplete="off">
        <label className="field"><span>{t("email")}</span><input name="email" type="email" autoComplete="off" required /></label>
        <label className="field"><span>{t("password")}</span><input name="password" type="password" autoComplete="new-password" required /></label>
        <label className="field"><span>{t("code")} <span className="font-normal text-muted">({t("optional")})</span></span><input name="totp" inputMode="numeric" autoComplete="one-time-code" /></label>
        <p className="text-sm text-muted">{t("showPassword")}</p>
        {error ? <p role="alert">{error}</p> : null}
        <button className="btn btn-primary w-fit" type="submit">{nav("login")}</button>
      </form>
      <form className="card grid gap-3 p-5" onSubmit={onMagic} autoComplete="off">
        <label className="field"><span>{t("email")}</span><input name="email" type="email" autoComplete="off" required /></label>
        <button className="btn btn-ghost w-fit" type="submit">{t("signInLink")}</button>
        {magic ? <p>{magic}</p> : null}
      </form>
    </div>
  );
}

export function TotpPanel({ enabled }: { enabled: boolean }) {
  const t = useTranslations("chrome");
  const locale = useLocale();
  const [setup, setupAction] = useFormState(beginTotp, null);
  const [confirm, confirmAction] = useFormState(confirmTotp, null);
  if (enabled) {
    return (
      <form action={disableTotp} className="grid gap-3">
        <input type="hidden" name="locale" value={locale} />
        <p>{t("twoFactorOn")}</p>
        <label className="field"><span>{t("disableHint")}</span><input name="code" inputMode="numeric" autoComplete="one-time-code" required /></label>
        <button className="btn btn-ghost w-fit" type="submit">{t("disable2fa")}</button>
      </form>
    );
  }
  return (
    <div className="grid gap-4">
      <form action={setupAction} className="grid gap-3">
        <input type="hidden" name="locale" value={locale} />
        <button className="btn btn-primary w-fit" type="submit">{t("enable2fa")}</button>
      </form>
      {setup?.qr ? (
        <form action={confirmAction} className="grid gap-3">
          <input type="hidden" name="locale" value={locale} />
          {/* QR is a one-time data URL from the authenticator setup. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="" width={180} height={180} />
          <p>{t("qr")}</p>
          <p><span className="font-semibold">{t("setupKey")}: </span><code>{setup.secret}</code></p>
          <p className="text-sm text-muted">{t("showOnce")}</p>
          <label className="field"><span>{t("confirmCode")}</span><input name="code" inputMode="numeric" autoComplete="one-time-code" required /></label>
          <button className="btn btn-primary w-fit" type="submit">{t("enable2fa")}</button>
          {confirm?.error ? <p role="alert">{t("totpBad")}</p> : null}
          {confirm?.ok ? <p>{t("twoFactorOn")}</p> : null}
        </form>
      ) : null}
    </div>
  );
}

export function WithdrawCode() {
  const t = useTranslations("chrome");
  const locale = useLocale();
  const [state, action] = useFormState(makeWithdrawCode, null);
  return (
    <div className="grid gap-3">
      <form action={action}>
        <input type="hidden" name="locale" value={locale} />
        <button className="btn btn-ghost" type="submit">{t("generateCode")}</button>
      </form>
      {state?.code ? <p>{t("enterCode")}: <strong>{state.code}</strong>. {t("notPassword")}</p> : null}
    </div>
  );
}

/** Lightweight CSS float — replaces framer-motion HeroDecor. */
export function HeroDecor({ children }: { children: React.ReactNode }) {
  return <div className="float-y">{children}</div>;
}

/** Subtle fade/slide-in on scroll — explains hierarchy, not decoration. */
export function RevealOnScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-in");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
