"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/components/catalog-provider";
import { getSupabase } from "@/lib/supabase";

export type AuthTexts = {
  signIn: string;
  signUp: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordHint: string;
  forgot: string;
  sendReset: string;
  resetSent: (email: string) => string;
  backToSignIn: string;
  newPassword: string;
  savePassword: string;
  passwordSaved: string;
  confirmEmail: (email: string) => string;
  wrongLogin: string;
  emailTaken: string;
  error: string;
  wait: string;
};

type Mode = "signin" | "signup" | "forgot";

const input =
  "h-12 w-full rounded-xl border border-[#dfe3ea] bg-white px-3.5 text-[15px] font-semibold outline-none focus:border-navy focus:ring-2 focus:ring-navy/15";
const primary =
  "flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-accent font-extrabold text-white hover:bg-accent-dark disabled:cursor-wait disabled:opacity-70";
const link = "min-h-10 cursor-pointer text-sm font-bold text-muted underline";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

/**
 * Email + password sign-in / sign-up / password reset (Supabase Auth).
 * The session is picked up by CatalogProvider's auth listener.
 */
export function AuthForm({ texts, redirectPath, allowSignUp = true }: { texts: AuthTexts; redirectPath: string; allowSignUp?: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function switchTo(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}${redirectPath}`;

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (err) setError(err.message.toLowerCase().includes("invalid") ? texts.wrongLogin : err.message || texts.error);
    } else if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: name.trim(), phone: phone.trim() }, emailRedirectTo: redirectTo },
      });
      if (err) {
        setError(err.message.toLowerCase().includes("registered") ? texts.emailTaken : err.message || texts.error);
      } else if (!data.session) {
        // Email confirmation is switched on in Supabase: the user must click the link first.
        setNotice(texts.confirmEmail(cleanEmail));
      }
    } else {
      const { error: err } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      if (err) setError(err.message || texts.error);
      else setNotice(texts.resetSent(cleanEmail));
    }
    setBusy(false);
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => switchTo(m)}
      className={`h-10 flex-1 cursor-pointer rounded-full text-sm font-extrabold ${mode === m ? "bg-navy text-white" : "text-navy"}`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      {allowSignUp && mode !== "forgot" && (
        <div role="tablist" className="flex rounded-full bg-surface p-1">
          {tab("signin", texts.signIn)}
          {tab("signup", texts.signUp)}
        </div>
      )}

      {mode === "signup" && (
        <Field label={texts.name}>
          <input className={input} required autoComplete="name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      )}
      <Field label={texts.email}>
        <input className={input} type="email" required dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {mode === "signup" && (
        <Field label={texts.phone}>
          <input
            className={input}
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="+961 70 123 456"
            pattern="[+0-9 ()\-]{7,20}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
      )}
      {mode !== "forgot" && (
        <Field label={texts.password} hint={mode === "signup" ? texts.passwordHint : undefined}>
          <input
            className={input}
            type="password"
            required
            minLength={6}
            dir="ltr"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
      )}

      {error && <p role="alert" className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-pastel-mint p-3 text-sm font-bold">{notice}</p>}

      <button type="submit" disabled={busy} className={primary}>
        {busy ? texts.wait : mode === "signin" ? texts.signIn : mode === "signup" ? texts.signUp : texts.sendReset}
      </button>

      {mode === "signin" && (
        <button type="button" onClick={() => switchTo("forgot")} className={link}>
          {texts.forgot}
        </button>
      )}
      {mode === "forgot" && (
        <button type="button" onClick={() => switchTo("signin")} className={link}>
          {texts.backToSignIn}
        </button>
      )}
    </form>
  );
}

/** Shown after opening a password-reset link. */
export function NewPasswordForm({ texts }: { texts: AuthTexts }) {
  const { endRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message || texts.error);
      return;
    }
    alert(texts.passwordSaved);
    endRecovery();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <Field label={texts.newPassword} hint={texts.passwordHint}>
        <input
          className={input}
          type="password"
          required
          minLength={6}
          dir="ltr"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && <p role="alert" className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}
      <button type="submit" disabled={busy} className={primary}>
        {busy ? texts.wait : texts.savePassword}
      </button>
    </form>
  );
}
