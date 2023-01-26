import React from "react";
import "./Map.css";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import nationalRoute from "./nationalRoute.json";

let southWest = L.latLng(19.41558, -128.807311);
let northEast = L.latLng(62.387941, -56.355762);
let bounds = L.latLngBounds(southWest, northEast);

function Map() {
  return (
    <>
      <details>
        <summary>
          Saved Trains
        </summary>
        <section>
        <p>Train</p>
        <p>Train</p>
        <p>Train</p>
        <p>Train</p>
        <p>Train</p>
          
        </section>
      </details>
      <MapContainer
        center={[39.14710270770074, -96.1962890625]}
        zoom={5}
        minZoom={0}
        maxZoom={14}
        wheelPxPerZoomLevel={120}
        maxBounds={bounds}
        tileSize={512}
        style={{
          height: "100vh",
          width: "100vw",
          zIndex: 0,
          overflow: "hidden",
        }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer url={`https://tile.amtrakle.com/13/2105/3038.png`} />
        <TileLayer
          url={`https://tile.amtrakle.com/{z}/{x}/{y}.png`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          key={"lines"}
          data={nationalRoute}
          style={{ color: "#6d33ff", weight: 1 }}
        />
      </MapContainer>
    </>
  );
}

export default Map;
