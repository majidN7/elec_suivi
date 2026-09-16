"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { LanguageSwitcher } from "@/components/language-switcher";

function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">{tc("appName")}</h1>
          <LanguageSwitcher />
        </div>
        <h2 className="mb-1 text-xl font-bold text-slate-900">{t("loginTitle")}</h2>
        <p className="mb-6 text-sm text-slate-500">{t("loginSubtitle")}</p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("email")}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <SubmitButton
            pendingLabel={tc("loading")}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
