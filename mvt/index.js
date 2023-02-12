const fs = require('fs');
const protobuf = require('protobufjs');

//decode protobuf from 2.mvt using schema in mvt.proto
const root = protobuf.loadSync('mvt.proto');
const VectorTile = root.lookupType('vector_tile.Tile');

const buffer = fs.readFileSync('2.mvt');
const tile = VectorTile.decode(buffer);

tile.layers.forEach((layer) => {
  console.log(layer.name, layer.features.length)
  if (layer.name === 'landcover') {
    console.log(layer)
  }
})