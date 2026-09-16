"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const t = useTranslations("auth");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      <LogOut className="h-4 w-4 text-slate-400" />
      {t("logout")}
    </button>
  );
}
