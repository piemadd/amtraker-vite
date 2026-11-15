import { getLocale } from "../paraglide/runtime.js";

// the regional locale used for formatting dates/times (Intl.DateTimeFormat) in each app language
const intlLocales = {
  en: "en-US",
  fr: "fr-CA",
  es: "es-MX"
};

export const getIntlLocale = () => intlLocales[getLocale()] ?? "en-US";
