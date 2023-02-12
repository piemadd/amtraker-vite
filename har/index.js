const fetch = require('node-fetch');
const fs = require('fs');

const current = JSON.parse(fs.readFileSync('./current.json', 'utf8'));

let total = 0;
let newTotal = 0;

current.log.entries.sort((a, b) => {
  return a.response.bodySize - b.response.bodySize;
}).forEach((entry) => {
  if (entry.response.bodySize > 0) {
    console.log(entry.request.url)
    const encoded = Buffer.from(entry.response.content.text, 'base64');

    total += entry.response.bodySize;

    const url = entry.request.url.split('.com/')[1].replace('.png', '.mvt');

    fetch(`http://10.0.0.237:8081/na-latest/${url}`)
      .then(res => res.text())
      .then(text => {
        const newEncoded = Buffer.from(text, 'utf8');

        console.log(newEncoded.length)

        newTotal += newEncoded.length;

        console.log('total', total);
        console.log('newTotal', newTotal);
      });
  }
})