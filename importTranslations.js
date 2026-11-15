import fs from "fs";

const settings = JSON.parse(fs.readFileSync("./project.inlang/settings.json", "utf8"));
const { baseLocale, locales } = settings;
const pathPattern = settings["plugin.inlang.messageFormat"].pathPattern;
const inputPath = "translations.csv";

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((row) => row.some((cell) => cell.length > 0)); 
};

const placeholdersOf = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",");

const getParent = (object, dottedKey, create) => {
  const parts = dottedKey.split(".");
  let current = object;
  for (const part of parts.slice(0, -1)) {
    if (typeof current[part] !== "object" || Array.isArray(current[part])) {
      if (!create) return [null, null];
      current[part] = {};
    }
    current = current[part];
  }
  return [current, parts.at(-1)];
};

const setMessage = (object, dottedKey, value) => {
  const [parent, key] = getParent(object, dottedKey, true);
  parent[key] = value;
};

const removeMessage = (object, dottedKey) => {
  const [parent, key] = getParent(object, dottedKey, false);
  if (parent) delete parent[key];
};

const getMessage = (object, dottedKey) => {
  const [parent, key] = getParent(object, dottedKey, false);
  return parent ? parent[key] : undefined;
};

const [header, ...rows] = parseCsv(fs.readFileSync(inputPath, "utf8").replace(/^﻿/, ""));
if (header[0] !== "key") throw new Error(`The first column of ${inputPath} must be "key"`);

const csvLocales = header.slice(1);
csvLocales
  .filter((locale) => !locales.includes(locale))
  .forEach((locale) => console.warn(`Skipping column "${locale}", it isn't a locale in project.inlang/settings.json`));
const importLocales = csvLocales.filter((locale) => locales.includes(locale));

const plainMessages = new Map();
const variantMessages = new Map();
const errors = [];

rows.forEach((row, i) => {
  const key = row[0].trim();
  const cells = Object.fromEntries(importLocales.map((locale) => [locale, row[header.indexOf(locale)] ?? ""]));
  const variantMatch = key.match(/^(.+)\[(.+)\]$/);

  if (variantMatch) {
    const [, baseKey, matchKey] = variantMatch;
    if (!variantMessages.has(baseKey)) variantMessages.set(baseKey, new Map());
    variantMessages.get(baseKey).set(matchKey, cells);
  } else {
    if (plainMessages.has(key)) errors.push(`Row ${i + 2}: duplicate key "${key}"`);
    if (importLocales.includes(baseLocale) && cells[baseLocale].length === 0) {
      errors.push(`Row ${i + 2}: "${key}" has no ${baseLocale} text`);
    }
    plainMessages.set(key, cells);
  }
});

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const loadLocale = (locale) => {
  const path = pathPattern.replace("{locale}", locale);
  return fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path, "utf8"))
    : { $schema: "https://inlang.com/schema/inlang-message-format" };
};

const baseMessages = loadLocale(baseLocale);
const warnings = [];

importLocales.forEach((locale) => {
  const messages = locale === baseLocale ? baseMessages : loadLocale(locale);
  let updated = 0;
  let removed = 0;

  plainMessages.forEach((cells, key) => {
    const text = cells[locale];
    const baseText = plainMessages.get(key)[baseLocale] ?? getMessage(baseMessages, key);

    if (text.length === 0) {
      if (getMessage(messages, key) !== undefined) removed++;
      removeMessage(messages, key);
      return;
    }

    if (typeof baseText === "string" && placeholdersOf(text) !== placeholdersOf(baseText)) {
      warnings.push(`${locale} "${key}": placeholders {${placeholdersOf(text)}} don't match ${baseLocale} {${placeholdersOf(baseText)}}`);
    }
    if (getMessage(messages, key) !== text) updated++;
    setMessage(messages, key, text);
  });

  variantMessages.forEach((variants, key) => {
    const match = {};
    variants.forEach((cells, matchKey) => {
      if (cells[locale].length > 0) match[matchKey] = cells[locale];
    });

    if (Object.keys(match).length === 0) {
      if (getMessage(messages, key) !== undefined) removed++;
      removeMessage(messages, key);
      return;
    }

    const existing = getMessage(messages, key)?.[0] ?? getMessage(baseMessages, key)?.[0];
    if (!existing) {
      warnings.push(`${locale} "${key}": no existing declarations/selectors to use for this variant message, skipped`);
      return;
    }

    const newValue = [{ declarations: existing.declarations, selectors: existing.selectors, match }];
    if (JSON.stringify(getMessage(messages, key)) !== JSON.stringify(newValue)) updated++;
    setMessage(messages, key, newValue);
  });

  const path = pathPattern.replace("{locale}", locale);
  fs.writeFileSync(path, JSON.stringify(messages, null, 2) + "\n");
  console.log(`${locale}: ${updated} updated, ${removed} removed -> ${path}`);
});

if (warnings.length > 0) console.warn("\nWarnings:\n" + warnings.join("\n"));
