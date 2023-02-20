const fs = require('fs');
const protobuf = require('protobufjs');

let fullFeatureKeys = [];

const listOutTileInfo = (tile) => {
  let featureKeys = {};
  let featureCounts = {};
  let featureDict = {};

  tile.layers.forEach((layer) => {
    if (fullFeatureKeys.indexOf(layer.name) === -1) {
      fullFeatureKeys.push(layer.name);
    }
  })
}

//decode protobuf from 2.mvt using schema in mvt.proto
const root = protobuf.loadSync('mvt.proto');
const VectorTile = root.lookupType('vector_tile.Tile');

//const buffer = fs.readFileSync('0(3).mvt');
//const tile = VectorTile.decode(buffer);

const harInput = JSON.parse(fs.readFileSync('test.har'));

harInput.log.entries.forEach((entry, i, arr) => {
  if (entry.response.content.mimeType === 'application/x-protobuf') {
    const buffer = Buffer.from(entry.response.content.text, 'base64');
    const tile = VectorTile.decode(buffer);
    listOutTileInfo(tile);

    if (i === arr.length - 1) {
      console.log(fullFeatureKeys);
    }
  }
});