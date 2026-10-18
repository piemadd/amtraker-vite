import { m } from "../paraglide/messages.js";
import { stationNames } from "../data/stations.js";
import { trainNames } from "../data/trains.js";

const SITE_ORIGIN = "https://amtraker.com";
const DEFAULT_OG_IMAGE = "https://amtraker.com/content/images/amtraker-back.webp";
const ATLAS_OG_IMAGE = "https://amtraker.com/content/images/amtraker_cover.webp";
const API_HEADERS = {
  "User-Agent": "AmtrakerViteWorker/v3.21.19 (+https://amtraker.com)",
  "Amtraker-Version": "v3.21.19"
};

// url prefix and og:locale for each locale, english has no prefix
const LOCALES = {
  en: { prefix: "", ogLocale: "en_US" },
  fr: { prefix: "/fr", ogLocale: "fr_CA" },
  es: { prefix: "/es", ogLocale: "es_MX" }
};

// pages with fixed titles/descriptions, keyed by path without the locale prefix
// [title message, description message, og image]
const STATIC_PAGES = {
  "/": ["common_strings.amtraker_title", "common_strings.amtraker_meta_description"],
  "/index.html": ["common_strings.amtraker_title", "common_strings.amtraker_meta_description"],
  "/trains": ["pages.trains.list.page_title", "pages.trains.list.meta_description"],
  "/trains/full": [null, null],
  "/trains/leaderboard": ["pages.trains.leaderboard.page_title", null],
  "/stations": ["pages.stations.list.page_title", "pages.stations.list.meta_description"],
  "/map": ["pages.map.page_title", "pages.map.meta_description"],
  "/map/miniholdertest": [null, null],
  "/about": ["pages.about.page_title", "pages.about.meta_description"],
  "/about_settings": [null, null],
  "/settings": [null, null],
  "/privacy": [null, null],
  "/atlas": ["pages.atlas.index.page_title", "pages.atlas.index.meta_description", ATLAS_OG_IMAGE],
  "/atlas/add": ["pages.atlas.add.page_title", "pages.atlas.add.meta_description", ATLAS_OG_IMAGE],
  "/atlas/stats": ["pages.atlas.stats_ind.page_title", "pages.atlas.stats_ind.meta_description", ATLAS_OG_IMAGE],
  "/atlas/stats/all": [null, null, ATLAS_OG_IMAGE],
  "/atlas/delete": ["pages.atlas.delete_account.page_title", "pages.atlas.delete_account.meta_description", ATLAS_OG_IMAGE],
  "/bippityboppityicookadameatball": [null, null]
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

// splits /fr/trains/5 into { locale: "fr", path: "/trains/5" }
const parseLocalizedPath = (pathname) => {
  const match = pathname.match(/^\/(fr|es)(\/.*)?$/);
  const locale = match ? match[1] : "en";
  let path = match ? match[2] ?? "/" : pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return { locale, path };
};

const localizedUrl = (locale, path) => `${SITE_ORIGIN}${LOCALES[locale].prefix}${path}`;

// { ok: true, data } on success, { ok: false, notFound } otherwise
// network errors and timeouts are never treated as not found, so an api outage can't 404 real pages
const fetchJson = async (url) => {
  try {
    const res = await fetch(url, { headers: API_HEADERS, signal: AbortSignal.timeout(3000) });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, notFound: false };
  }
};

const isEmptyResult = (result) => result.ok && Array.isArray(result.data) && result.data.length === 0;

const getTrainMeta = async (locale, trainNum, trainDate) => {
  const code = trainDate ? `${trainNum}-${trainDate}` : trainNum;
  const live = await fetchJson(`https://api.amtraker.com/v3/trains/${encodeURIComponent(code)}`);
  const train = live.ok && !Array.isArray(live.data) ? live.data[trainNum]?.[0] : null;
  const ogImage = `https://ogimg.transitstat.us/images?service=amtraker&type=train&code=${encodeURIComponent(code)}`;

  if (train) {
    const inputs = { provider: train.provider, trainNum: train.trainNumRaw, routeName: train.routeName };
    return {
      title: trainDate
        ? m["pages.trains.page_title_with_date"]({ ...inputs, trainDate }, { locale })
        : m["pages.trains.page_title"](inputs, { locale }),
      description: m["pages.trains.meta_description"](inputs, { locale }),
      ogTitle: `${train.routeName} (${train.trainNumRaw}) - Amtraker`,
      ogImage,
      hasImageSize: true
    };
  }

  // a dated trip that's no longer running, the app sends these to the train number page so we do the same
  if (trainDate) return isEmptyResult(live) ? { redirectPath: `/trains/${trainNum}` } : {};

  if (!isEmptyResult(live)) return {}; // live api failed, can't say anything about this train

  // not running right now, but might still be scheduled
  let railroad = "amtrak";
  if (trainNum.startsWith("b")) railroad = "brightline";
  if (trainNum.startsWith("v")) railroad = "via_rail";
  const scheduled = await fetchJson(
    `https://store.transitstat.us/amtraker_route_meta/${railroad}/trainsByNum/${encodeURIComponent(trainNum)}`
  );

  if (scheduled.ok && scheduled.data.routeName) {
    const inputs = {
      provider: scheduled.data.provider,
      trainNum: scheduled.data.trainNumRaw,
      routeName: scheduled.data.routeName
    };
    return {
      title: m["pages.trains.page_title"](inputs, { locale }),
      description: m["pages.trains.meta_description"](inputs, { locale }),
      ogTitle: `${scheduled.data.routeName} (${scheduled.data.trainNumRaw}) - Amtraker`,
      ogImage,
      hasImageSize: true
    };
  }

  if (scheduled.notFound && !trainNames[trainNum]) return { notFound: true };
  return {};
};

const getStationMeta = async (locale, stationCode) => {
  const result = await fetchJson(`https://api.amtraker.com/v3/stations/${encodeURIComponent(stationCode)}`);
  const station = result.ok && !Array.isArray(result.data) ? result.data[stationCode] : null;
  const name = station?.name ?? stationNames[stationCode]; // static list as a backup if the api is having issues

  if (name) {
    return {
      title: m["pages.stations.station.page_title"]({ station: name }, { locale }),
      description: m["pages.stations.station.meta_description"]({ station: name }, { locale }),
      ogTitle: `${name} (${stationCode}) - Amtraker`,
      ogImage: `https://ogimg.transitstat.us/images?service=amtraker&type=station&code=${encodeURIComponent(stationCode)}`,
      hasImageSize: true
    };
  }

  if (isEmptyResult(result)) return { notFound: true };
  return {};
};

// returns everything the middleware needs to rewrite the page for this url
export const getPageMeta = async (url) => {
  const { locale, path } = parseLocalizedPath(url.pathname);
  let segments = [];
  let isMalformed = false;
  try {
    segments = path.split("/").filter((segment) => segment.length > 0).map(decodeURIComponent);
  } catch (e) {
    isMalformed = true; // bad percent encoding, treated as not found
  }

  let pageMeta = null;
  if (isMalformed) {
    // stays null, so it's a 404
  } else if (STATIC_PAGES[path]) {
    const [titleKey, descriptionKey, ogImage] = STATIC_PAGES[path];
    pageMeta = {
      title: titleKey ? m[titleKey]({}, { locale }) : null,
      description: descriptionKey ? m[descriptionKey]({}, { locale }) : null,
      ogImage
    };
  } else if (segments[0] === "trains" && segments[1] === "names" && segments.length === 3) {
    pageMeta = {};
  } else if (segments[0] === "trains" && (segments.length === 2 || segments.length === 3)) {
    pageMeta = await getTrainMeta(locale, segments[1], segments[2]);
  } else if (segments[0] === "stations" && segments.length === 2) {
    pageMeta = await getStationMeta(locale, segments[1]);
  }

  if (pageMeta?.redirectPath) {
    return { redirect: `${url.origin}${LOCALES[locale].prefix}${pageMeta.redirectPath}${url.search}` };
  }

  const notFound = pageMeta === null || pageMeta.notFound === true;
  const title = pageMeta?.title ?? m["common_strings.amtraker_title"]({}, { locale });
  const description = pageMeta?.description ?? m["common_strings.amtraker_meta_description"]({}, { locale });
  const canonicalPath = path === "/index.html" ? "/" : path;

  return {
    status: notFound ? 404 : 200,
    locale,
    title,
    description,
    canonical: notFound ? null : localizedUrl(locale, canonicalPath),
    alternates: notFound
      ? []
      : [
          ...Object.keys(LOCALES).map((altLocale) => [altLocale, localizedUrl(altLocale, canonicalPath)]),
          ["x-default", localizedUrl("en", canonicalPath)]
        ],
    ogTitle: pageMeta?.ogTitle ?? title,
    ogImage: pageMeta?.ogImage ?? DEFAULT_OG_IMAGE,
    hasImageSize: pageMeta?.hasImageSize ?? false
  };
};

// tags appended to <head>, the middleware removes the existing og/canonical/alternate tags first
export const buildHeadTags = (meta) => {
  const tags = [];

  if (meta.canonical) tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
  meta.alternates.forEach(([hreflang, href]) => {
    tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(href)}" />`);
  });

  tags.push(`<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  tags.push(`<meta property="og:type" content="website" />`);
  tags.push(`<meta property="og:locale" content="${LOCALES[meta.locale].ogLocale}" />`);
  Object.keys(LOCALES)
    .filter((locale) => locale !== meta.locale)
    .forEach((locale) => tags.push(`<meta property="og:locale:alternate" content="${LOCALES[locale].ogLocale}" />`));
  if (meta.canonical) tags.push(`<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`);
  tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`);
  if (meta.hasImageSize) {
    tags.push(`<meta property="og:image:width" content="1200" />`);
    tags.push(`<meta property="og:image:height" content="630" />`);
  }

  return "\n    " + tags.join("\n    ") + "\n";
};
