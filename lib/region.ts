export const COUNTRIES = ["DK", "SE", "NO"] as const;
export const LANGUAGES = ["da", "sv", "nb"] as const;
export type Country = typeof COUNTRIES[number];
export type Lang = typeof LANGUAGES[number];

export const regions = {
  DK: { name: "Danmark", flag: "🇩🇰", currency: "DKK", monthlyPrice: 29, priceKey: "STRIPE_PRICE_DKK", lang: "da", locale: "da-DK" },
  SE: { name: "Sverige", flag: "🇸🇪", currency: "SEK", monthlyPrice: 43, priceKey: "STRIPE_PRICE_SEK", lang: "sv", locale: "sv-SE" },
  NO: { name: "Norge", flag: "🇳🇴", currency: "NOK", monthlyPrice: 41, priceKey: "STRIPE_PRICE_NOK", lang: "nb", locale: "nb-NO" },
} as const;
export const languageNames: Record<Lang, string> = { da: "Dansk", sv: "Svenska", nb: "Norsk" };
export const locales: Record<Lang, string> = { da: "da-DK", sv: "sv-SE", nb: "nb-NO" };
export function isCountry(value: unknown): value is Country { return COUNTRIES.includes(value as Country); }
export function isLang(value: unknown): value is Lang { return LANGUAGES.includes(value as Lang); }
// Preserve the existing fallback for legacy profiles while recognising Norway.
export function storedCountry(value: unknown): Country { return isCountry(value) ? value : "DK"; }
export function storedLanguage(value: unknown): Lang { return isLang(value) ? value : "da"; }
