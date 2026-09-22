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

// BCP-47 tag used for Intl.NumberFormat / toLocaleString, so numbers and
// dates follow the active language instead of being hardcoded to French.
// "ar-MA" (Morocco) rather than a generic "ar" so digits stay in the
// Western Arabic numerals used locally, instead of Eastern Arabic-Indic ones.
export const intlLocale: Record<Locale, string> = {
  fr: "fr-FR",
  ar: "ar-MA",
};
