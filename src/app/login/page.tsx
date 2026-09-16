"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, Vote } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Alert } from "@/components/ui/alert";
import { Field, inputClass } from "@/components/ui/field";

function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, var(--color-brand-100) 0%, transparent 45%), radial-gradient(circle at 85% 85%, var(--color-brand-50) 0%, transparent 40%)",
        }}
      />

      <div className="absolute end-6 top-6 w-36">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <Vote className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold text-slate-900">{tc("appName")}</h1>
        </div>

        <h2 className="mb-1 text-xl font-bold text-slate-900">{t("loginTitle")}</h2>
        <p className="mb-6 text-sm text-slate-500">{t("loginSubtitle")}</p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <Field label={t("email")} htmlFor="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                className={`${inputClass} ps-9`}
              />
            </div>
          </Field>

          <Field label={t("password")} htmlFor="password">
            <div className="relative">
              <Lock className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-slate-400" />
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className={`${inputClass} ps-9`}
              />
            </div>
          </Field>

          {state?.error && <Alert variant="error">{state.error}</Alert>}

          <SubmitButton
            pendingLabel={tc("loading")}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("login")}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
