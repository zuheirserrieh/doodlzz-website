"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

export type SignInTexts = {
  intro: string;
  email: string;
  sendCode: string;
  sending: string;
  codeSent: (email: string) => string;
  code: string;
  verify: string;
  changeEmail: string;
  error: string;
};

const input =
  "h-12 w-full rounded-xl border border-[#dfe3ea] bg-white px-3.5 text-[15px] font-semibold outline-none focus:border-navy focus:ring-2 focus:ring-navy/15";
const button =
  "flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-accent font-extrabold text-white hover:bg-accent-dark disabled:cursor-wait disabled:opacity-70";

/**
 * Passwordless sign-in: Supabase emails a one-time code (and a link — either works).
 * The session is picked up by CatalogProvider's auth listener.
 */
export function EmailSignIn({ texts, redirectPath }: { texts: SignInTexts; redirectPath: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${redirectPath}` },
    });
    setBusy(false);
    if (err) {
      console.error(err);
      setError(err.message || texts.error);
      return;
    }
    setStep("code");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) {
      console.error(err);
      setError(texts.error);
    }
  }

  return step === "email" ? (
    <form onSubmit={sendCode} className="flex flex-col gap-3">
      <p className="text-ink-soft">{texts.intro}</p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">{texts.email}</span>
        <input
          className={input}
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {error && <p role="alert" className="text-sm font-bold text-accent-dark">{error}</p>}
      <button type="submit" disabled={busy} className={button}>
        {busy ? texts.sending : texts.sendCode}
      </button>
    </form>
  ) : (
    <form onSubmit={verify} className="flex flex-col gap-3">
      <p className="text-ink-soft">{texts.codeSent(email.trim())}</p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">{texts.code}</span>
        <input
          className={`${input} text-center text-xl tracking-[0.4em]`}
          required
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,10}"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
      </label>
      {error && <p role="alert" className="text-sm font-bold text-accent-dark">{error}</p>}
      <button type="submit" disabled={busy} className={button}>
        {busy ? texts.sending : texts.verify}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError("");
        }}
        className="min-h-11 cursor-pointer text-sm font-bold text-muted underline"
      >
        {texts.changeEmail}
      </button>
    </form>
  );
}
