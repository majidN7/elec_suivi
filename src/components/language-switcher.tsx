"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, localeCookieName, localeLabel, type Locale } from "@/i18n/config";

function setLocaleCookie(next: Locale) {
  document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000`;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            l === locale
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {localeLabel[l]}
        </button>
      ))}
    </div>
  );
}
