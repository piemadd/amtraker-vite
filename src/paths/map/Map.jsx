import React, { useState } from "react";
import { Map, GeoJson } from "pigeon-maps";
import "./Map.css";
import nationalRoute from "./nationalRoute.json";

import simplify from "@turf/simplify";
import bboxClip from "@turf/bbox-clip";
import { multiLineString, lineString } from "@turf/helpers";

const mapBounds = {
  north: 49.607314574082416,
  south: 31.23158255699691,
  east: -77.52636519767444,
  west: -120.13828388910343,
};

const parsedNationalRoute = multiLineString(
  nationalRoute.features.map((feature) => feature.geometry.coordinates)
);

const adjustRange = (value) => {
  console.log('zoom', value)
  const vals = {
    0: 0.01,
    1: 0.01,
    2: 0.01,
    3: 0.1,
    4: 0.01,
    5: 0.01,
    6: 0.01,
    7: 0.001,
    8: 0.0001,
    9: 0.0001,
    10: 0.0001,
    11: 0.0001,
    12: 0.0001,
    13: 0.0001,
    14: 0.00001,
    15: 0.00001
  }

  return vals[Math.ceil(value)];
};

const simplifyNationalRoute = (zoom, bounds) => {
  //console.log("clipping");
  const clipped = bboxClip(parsedNationalRoute, bounds);

  //console.log("geometry", clipped.geometry.coordinates);
  //console.log("simplifying");
  console.log("tolerance", adjustRange(zoom));

  const simplified = simplify(
    {
      type: "FeatureCollection",
      crs: nationalRoute.crs,
      features: clipped.geometry.coordinates.map((line) => {
        return lineString(line);
      }),
    },
    {
      //tolerance: 0.00001,
      tolerance: adjustRange(zoom),
      highQuality: true,
    }
  );

  console.log(
    simplified.features.map((feature) => feature.geometry.coordinates).flat()
      .length
  );

  return simplified;
};

const AmtrakerMap = () => {
  const [mapCenter, setCenter] = useState([39.14710270770074, -96.1962890625]);
  const [mapZoom, setZoom] = useState(4);

  const [simplifiedNationalRoute, setSimplifiedNationalRoute] = useState(
    simplifyNationalRoute(mapZoom, mapBounds)
  );

  return (
    <>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
            className='click'
          >
            Back
          </h2>
        </div>
        <div className='mapHolder'>
          <Map
            zoomSnap={false}
            minZoom={0}
            maxZoom={15}
            limitBounds={"edge"}
            center={mapCenter}
            zoom={mapZoom}
            provider={(x, y, z, dpr) => {
              return `https://tile.amtrakle.com/${z}/${x}/${y}.png`;
            }}
            attributionPrefix={false}
            attribution={
              <>
                <a href='https://pigeon-maps.js.org/'>Pigeon</a> | Map Tiles
                &copy; Amtraker | Map Data &copy;{" "}
                <a href='https://www.openstreetmap.org'>OSM Contributors</a>
              </>
            }
            onBoundsChanged={({ center, zoom, bounds, initial }) => {
              //console.log('center', center)
              //console.log('mapCenter', mapCenter)
              let newCoords = [center[0], center[1]];
              let newBounds = bounds;

              /*
              if (zoom >= 6) {
                if (center[0] > mapBounds.north) {
                  console.log("too north");
                  newCoords[0] = mapBounds.north;
                  newBounds.ne[0] = mapBounds.north;
                }
                if (center[0] < mapBounds.south) {
                  console.log("too south");
                  newCoords[0] = mapBounds.south;
                  newBounds.sw[0] = mapBounds.south;
                }
                if (center[1] > mapBounds.east) {
                  console.log("too east");
                  newCoords[1] = mapBounds.east;
                  newBounds.ne[1] = mapBounds.east;
                }
                if (center[1] < mapBounds.west) {
                  console.log("too west");
                  newCoords[1] = mapBounds.west;
                  newBounds.sw[1] = mapBounds.west;
                }
              }
              */

              const boundsWidth = newBounds.ne[1] - newBounds.sw[1];
              const boundsHeight = newBounds.ne[0] - newBounds.sw[0];

              //expand bounds past screen by 25%
              /*
              newBounds.ne[1] += boundsWidth * 0.25;
              newBounds.ne[0] += boundsHeight * 0.25;
              newBounds.sw[1] -= boundsWidth * 0.25;
              newBounds.sw[0] -= boundsHeight * 0.25;
              */
              //removed due to performance issues

              setSimplifiedNationalRoute(
                simplifyNationalRoute(zoom, [
                  newBounds.sw[1],
                  newBounds.sw[0],
                  newBounds.ne[1],
                  newBounds.ne[0],
                ])
              );

              setZoom(zoom);
              setCenter(newCoords);

              console.log(center, zoom);
            }}
          >
            <GeoJson data={simplifiedNationalRoute} />
          </Map>
        </div>
      </div>
    </>
  );
};

export default AmtrakerMap;
