"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const t = useTranslations("auth");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
    >
      {t("logout")}
    </button>
  );
}
