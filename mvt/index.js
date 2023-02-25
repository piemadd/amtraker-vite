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

const buffer = fs.readFileSync('0(6).mvt');
const tile = VectorTile.decode(buffer);

//console.dir(tile, { depth: null });
let layerGeometries = {};

tile.layers.forEach((layer) => {
  layerGeometries[layer.name] = layer.features.flatMap((feature) => {
    return feature.geometry;
  }).length;
});

Object.keys(layerGeometries).sort((a, b) => {
  return layerGeometries[b] - layerGeometries[a];
}).forEach((layerName) => {
  console.log(layerName, layerGeometries[layerName]);
});

//const harInput = JSON.parse(fs.readFileSync('test.har'));
/*
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
*/