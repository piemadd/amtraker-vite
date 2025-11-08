import fs from 'fs';
import { stationNames } from './src/data/stations.js';
import { trainNames } from './src/data/trains.js';

const sitemap = fs.createWriteStream('./public/sitemap.xml');

const now = new Date();
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');

(async () => {
  const trainsRes = await fetch('https://api.amtraker.com/v3/trains');
  const stationsRes = await fetch('https://api.amtraker.com/v3/stations');

  const trainsData = await trainsRes.json();
  const stationsData = await stationsRes.json();

  const newTrainsData = {
    ...trainNames,
    ...trainsData
  };

  const newStationsData = {
    ...stationNames,
    ...stationsData,
  }

  sitemap.write('<?xml version="1.0" encoding="UTF-8"?>');
  sitemap.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  sitemap.write(`
  <url>
    <loc>https://amtraker.com/</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>never</changefreq>
    <priority>1.0</priority>
  </url>
`);

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
  [...new Set(Object.keys(newTrainsData))].forEach((trainNum) => {
    sitemap.write(`
  <url>
    <loc>https://amtraker.com/trains/${trainNum}</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`);
  });

  // station codes
  [...new Set(Object.keys(newStationsData))].forEach((station) => {
    sitemap.write(`
  <url>
    <loc>https://amtraker.com/stations/${station}</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>
`);
  });

  // train list
  sitemap.write(`
  <url>
    <loc>https://amtraker.com/trains</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.6</priority>
  </url>
`);

  // station list
  sitemap.write(`
  <url>
    <loc>https://amtraker.com/stations</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>
`);

  // map
  sitemap.write(`
  <url>
    <loc>https://amtraker.com/map</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.4</priority>
  </url>
`);

  // about page
  sitemap.write(`
  <url>
    <loc>https://amtraker.com/about</loc>
    <lastmod>${year}-${month}-${day}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.3</priority>
  </url>
`);

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