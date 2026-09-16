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
    <div className="flex items-center gap-1 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          className={`rounded px-2 py-1 ${
            l === locale
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          {localeLabel[l]}
        </button>
      ))}
    </div>
  );
}
