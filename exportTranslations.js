import fs from "fs";

const settings = JSON.parse(fs.readFileSync("./project.inlang/settings.json", "utf8"));
const { baseLocale, locales } = settings;
const pathPattern = settings["plugin.inlang.messageFormat"].pathPattern;
const outputPath = "translations.csv";

const isVariantMessage = (value) => Array.isArray(value);

const flattenMessages = (object, prefix = "", result = {}) => {
  Object.entries(object).forEach(([key, value]) => {
    if (key === "$schema") return;
    const fullKey = prefix + key;

    if (isVariantMessage(value)) {
      if (value.length !== 1) throw new Error(`${fullKey}: only variant messages with a single entry are supported`);
      Object.entries(value[0].match).forEach(([matchKey, text]) => (result[`${fullKey}[${matchKey}]`] = text));
    } else if (typeof value === "object") {
      flattenMessages(value, fullKey + ".", result);
    } else {
      result[fullKey] = value;
    }
  });
  return result;
};

const csvField = (value) => {
  const text = value ?? "";
  return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replaceAll('"', '""')}"` : text;
};

const messagesByLocale = Object.fromEntries(
  locales.map((locale) => {
    const path = pathPattern.replace("{locale}", locale);
    return [locale, fs.existsSync(path) ? flattenMessages(JSON.parse(fs.readFileSync(path, "utf8"))) : {}];
  })
);

const uniqueKeys = [...new Set([baseLocale, ...locales].flatMap((locale) => Object.keys(messagesByLocale[locale])))];
const messageKeyOf = (key) => key.replace(/\[.+\]$/, "");
const firstIndexOfMessage = new Map();
uniqueKeys.forEach((key, i) => {
  if (!firstIndexOfMessage.has(messageKeyOf(key))) firstIndexOfMessage.set(messageKeyOf(key), i);
});
const allKeys = uniqueKeys
  .map((key, i) => [key, i])
  .sort(([keyA, iA], [keyB, iB]) => firstIndexOfMessage.get(messageKeyOf(keyA)) - firstIndexOfMessage.get(messageKeyOf(keyB)) || iA - iB)
  .map(([key]) => key);

const orderedLocales = [baseLocale, ...locales.filter((locale) => locale !== baseLocale)];
const rows = [
  ["key", ...orderedLocales],
  ...allKeys.map((key) => [key, ...orderedLocales.map((locale) => messagesByLocale[locale][key])])
];

fs.writeFileSync(outputPath, rows.map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n");

const missing = orderedLocales
  .filter((locale) => locale !== baseLocale)
  .map((locale) => `${locale}: ${allKeys.filter((key) => !messagesByLocale[locale][key]).length} empty`);
console.log(`Exported ${allKeys.length} messages for ${orderedLocales.join(", ")} to ${outputPath} (${missing.join(", ")})`);
