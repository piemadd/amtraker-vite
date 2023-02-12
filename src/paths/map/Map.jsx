import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, Marker, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import layers from "protomaps-themes-base";
import nationalRoute from "./nationalRoute.json";
import mapStyle from "./style.json";
import MarkerIcon from "./MarkerIcon.jsx";
//import bbox from "@turf/bbox";
import ManualTrainPopup from "../../components/trainBox/maualTrainPopup";

//adding pmtiles protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const dataLayer = {
  id: "line",
  type: "fill",
  paint: {
    "fill-color": {
      property: "percentile",
      stops: [
        [0, "#3288bd"],
        [1, "#66c2a5"],
        [2, "#abdda4"],
        [3, "#e6f598"],
        [4, "#ffffbf"],
        [5, "#fee08b"],
        [6, "#fdae61"],
        [7, "#f46d43"],
        [8, "#d53e4f"],
      ],
    },
    "fill-opacity": 0.8,
  },
};

const AmtrakerMap = () => {
  const [allData, setAllData] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const navigate = useNavigate();

  const savedTrains = useMemo(() => {
    if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
      localStorage.setItem("savedTrainsAmtrakerV3", "");
    }

    return localStorage
      .getItem("savedTrainsAmtrakerV3")
      .split(",")
      .filter((n) => n);
  });
  console.log(savedTrains);

  const markers = useMemo(() => {
    return allData.map((train) => {
      return (
        <Marker
          latitude={train.lat}
          longitude={train.lon}
          anchor='center'
          dsadrotationAlignment='map'
          key={`train-marker-${train.trainID}`}
          height={"48px"}
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(train);
          }}
        >
          <MarkerIcon
            num={train.trainNum}
            trainTimely={train.trainTimely}
            trainState={train.trainState}
            direction={train.heading}
            height={"48px"}
          />
        </Marker>
      );
    });
  }, [allData]);

  const usaBounds = {
    sw: { lat: 24.9493, lng: -125.0011 },
    ne: { lat: 49.5904, lng: -66.9326 },
  };
  const testMarkers = useMemo(() => {
    let final = [];

    for (let i = 0; i < 500; i++) {
      //generate random points in the USA
      const lat =
        Math.random() * (usaBounds.ne.lat - usaBounds.sw.lat) +
        usaBounds.sw.lat;
      const lng =
        Math.random() * (usaBounds.ne.lng - usaBounds.sw.lng) +
        usaBounds.sw.lng;

      final.push(
        <Marker
          latitude={lat}
          longitude={lng}
          anchor='center'
          dsadrotationAlignment='map'
          key={`test-marker-${i}`}
          height={"48px"}
        >
          <MarkerIcon
            num={i}
            trainTimely={"On Time"}
            trainState={"Active"}
            direction={"ne"}
            height={"48px"}
          />
        </Marker>
      );
    }

    return final;
  }, []);

  useEffect(() => {
    setInterval(() => {
      fetch("https://api-v3.amtraker.com/v3/trains")
        .then((res) => res.json())
        .then((data) => {
          console.log(allData);

          const currentTwenty = allData.filter((n) => n.trainNum == 20)[0];
          const newTwenty = Object.values(data)
            .flatMap((n) => n)
            .filter((n) => n.trainNum == 20)[0];

          if (currentTwenty && newTwenty) {
            if (
              currentTwenty.lat != newTwenty.lat ||
              currentTwenty.lon != newTwenty.lon
            ) {
              console.log("20 moved");
            }
          } else {
            console.log("20 not found, wait til next time ig idk");
          }

          setAllData(
            JSON.parse(JSON.stringify(Object.values(data).flatMap((n) => n)))
          );
        });
    }, 60000);
    fetch("https://api-v3.amtraker.com/v3/trains")
      .then((res) => res.json())
      .then((data) => {
        setAllData(Object.values(data).flatMap((n) => n));
      });
  }, []);

  let baseStyle = mapStyle.layers;
  const baseStyleIDs = baseStyle.map((layer) => layer.id);

  layers("protomaps", "dark").forEach((layer) => {
    if (!baseStyleIDs.includes(layer.id)) {
      baseStyle.push(layer);
    }
  });

  return (
    <>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
            className='click noselect'
          >
            Back
          </h2>
          {navigator.share ? (
            <h2
              onClick={() => {
                navigator.share({
                  title: "Amtraker Map",
                  url: "https://amtraker.com/map",
                });
              }}
              className='click'
            >
              Share
            </h2>
          ) : null}
        </div>
        <div className='mapHolder'>
          <Map
            mapLib={maplibregl}
            minZoom={3}
            maxZoom={16}
            initialViewState={{
              latitude: 41.884579601743276,
              longitude: -87.6279871036212,
              zoom: 3,
              pitch: 0,
              bearing: 0,
            }}
            renderWorldCopies={false}
            mapStyle={{
              id: "43f36e14-e3f5-43c1-84c0-50a9c80dc5c7",
              name: "MapLibre",
              zoom: 3,
              pitch: 0,
              center: [41.884579601743276, -87.6279871036212],
              glyphs:
                "https://cdn.jsdelivr.net/gh/piemadd/fonts@a77fb90360c26d9838438c5543026aa3af2a46f5/_output/{fontstack}/{range}.pbf",
              layers: baseStyle,
              bearing: 0,
              sources: {
                protomaps: {
                  type: "vector",
                  tiles: ["https://tile.piemadd.com/na-latest/{z}/{x}/{y}.mvt"],
                  attribution:
                    '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
                  maxzoom: 13
                },
                nationalRoute: {
                  type: "geojson",
                  data: nationalRoute,
                }
              },
              version: 8,
              metadata: {},
            }}
            oldMapStyle={{
              version: 8,
              glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
              sources: {
                protomaps: {
                  type: "vector",
                  url: "http://10.0.0.237:8081/illinois-latest.pmtiles",
                  attribution:
                    '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
                },
              },
              layers: layers("protomaps", "dark"),
            }}
          >
            <Layer
              id='nationalRoute'
              type='line'
              source='nationalRoute'
              paint={{
                "line-color": "#092de3",
                "line-opacity": 1,
                "line-width": 2,
              }}
            />
            {markers}

            {popupInfo && (
              <Popup
                anchor='top'
                longitude={Number(popupInfo.lon)}
                latitude={Number(popupInfo.lat)}
                onClose={() => setPopupInfo(null)}
              >
                <ManualTrainPopup train={popupInfo} />
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </>
  );
};

export default AmtrakerMap;
