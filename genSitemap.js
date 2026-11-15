import fs from 'fs';
import { stationNames } from './src/data/stations.js';
import { trainNames } from './src/data/trains.js';

const sitemap = fs.createWriteStream('./public/sitemap.xml');

const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');

const lastmod = `${year}-${month}-${day}`;

// locales with their url prefix, english has none
const alternateLocales = [
  ['en', ''],
  ['es', '/es'],
  ['fr', '/fr'],
];

// path is relative to the site root, ie /trains/5
// translated pages get one entry per locale, each listing every version of the page (plus x-default)
// lastmod is only included for pages with live data, since today's date would be wrong for the static ones
const writeUrl = (path, changefreq, priority, { translated = true, live = false } = {}) => {
  const alternates = translated
    ? [
        ...alternateLocales.map(([locale, prefix]) => [locale, `https://amtraker.com${prefix}${path}`]),
        ['x-default', `https://amtraker.com${path}`],
      ]
        .map(([hreflang, href]) => `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`)
        .join('')
    : '';

  const prefixes = translated ? alternateLocales.map(([, prefix]) => prefix) : [''];

  prefixes.forEach((prefix) => {
    sitemap.write(`
  <url>
    <loc>https://amtraker.com${prefix}${path}</loc>${live ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${alternates}
  </url>
`);
  });
};

(async () => {
  const amtrakTrainsRes = await fetch('https://store.transitstat.us/amtraker_route_meta/amtrak/trainsByNum');
  const brightlineTrainsRes = await fetch('https://store.transitstat.us/amtraker_route_meta/brightline/trainsByNum');
  const viaTrainsRes = await fetch('https://store.transitstat.us/amtraker_route_meta/via_rail/trainsByNum');

  const amtrakTrainsData = await amtrakTrainsRes.json();
  const brightlineTrainsData = await brightlineTrainsRes.json();
  const viaTrainsData = await viaTrainsRes.json();

  const stationsRes = await fetch('https://api.amtraker.com/v3/stations');
  const stationsData = await stationsRes.json();

  let finalTrains = {};

  [...Object.keys(amtrakTrainsData), ...Object.keys(brightlineTrainsData), ...Object.keys(viaTrainsData)].forEach((trainNum) => finalTrains[trainNum] = true);

  const newStationsData = {
    ...stationNames,
    ...stationsData,
  }

  sitemap.write('<?xml version="1.0" encoding="UTF-8"?>');
  sitemap.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');
  writeUrl('/', 'never', '1.0');
  writeUrl('/llms.txt', 'never', '0.9', { translated: false });

  // train names
  /*
  [...new Set(Object.values(trainNames))].forEach((trainName) => {
    sitemap.write(`
    <url>
      <loc>https://amtraker.com/trains/names/${trainName.replaceAll(' ', '%20')}</loc>
      <lastmod>${year}-${month}-${day}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>
  `);
  });
  */

  // train numbers
  [...new Set(Object.keys(finalTrains))].forEach((trainNum) => {
    writeUrl(`/trains/${trainNum}`, 'daily', '0.8', { live: true });
  });

  // station codes
  [...new Set(Object.keys(newStationsData))].forEach((station) => {
    writeUrl(`/stations/${station}`, 'hourly', '0.7', { live: true });
  });

  // train list
  writeUrl('/trains', 'hourly', '0.6', { live: true });

  // full train list, meant for crawlers
  writeUrl('/trains/full', 'monthly', '0.5');

  // station list
  writeUrl('/stations', 'never', '0.5');

  // map
  writeUrl('/map', 'never', '0.4');

  // atlas
  writeUrl('/atlas', 'never', '0.3');

  // about/settings page
  writeUrl('/about', 'never', '0.3');

  sitemap.write('</urlset>');
  sitemap.end();
})();
/*
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com/foo.html</loc>
    <lastmod>2022-06-04</lastmod>
  </url>
</urlset>
*/