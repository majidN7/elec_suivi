export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const localeCookieName = "NEXT_LOCALE";

export const localeDir: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  ar: "rtl",
};

export const localeLabel: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
};
