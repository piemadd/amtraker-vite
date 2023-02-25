import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, Marker, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import layers from "protomaps-themes-base";
import mapStyle from "./style.json";
import MarkerIcon from "./MarkerIcon.jsx";
//import bbox from "@turf/bbox";
import ManualTrainPopup from "../../components/trainBox/maualTrainPopup";

//adding pmtiles protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const toHoursAndMinutesLate = (date1, date2) => {
  if (
    date1.toString() === "Invalid Date" ||
    date2.toString() === "Invalid Date"
  )
    return "Estimate Error";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Schedule Error";

  const hours = Math.floor(Math.abs(diff) / 1000 / 60 / 60);
  const minutes = Math.floor((Math.abs(diff) / 1000 / 60 / 60 - hours) * 60);

  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  if (hours === 0) amount = `${Math.abs(minutes)}m`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;

  //on time
  if (diff === 0) return "On Time";

  //late or early
  return diff > 0 ? `${amount} late` : `${amount} early`;
};

const colorizedToHoursAndMinutesLate = (date1, date2) => {
  const res = toHoursAndMinutesLate(date1, date2);

  if (res === "Estimate Error") return <span className='late-text'>{res}</span>;
  if (res === "Schedule Error") return <span className='late-text'>{res}</span>;
  if (res === "On Time") return <span className='on-time-text'>{res}</span>;
  if (res.includes("late")) return <span className='late-text'>{res}</span>;
  if (res.includes("early")) return <span className='early-text'>{res}</span>;

  return <span className='error'>{res}</span>;
};

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
  const [open, setOpen] = useState(true);
  const ref = useRef();
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
      const currentStation = train.stations.find(
        (station) => station.code === train.eventCode
      );

      const trainStatus = toHoursAndMinutesLate(
        new Date(currentStation.arr ?? currentStation.dep),
        new Date(currentStation.schArr ?? currentStation.schDep)
      );

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
            trainTimely={trainStatus}
            trainState={train.trainState}
            direction={train.heading}
            height={"48px"}
          />
        </Marker>
      );
    });
  }, [allData]);

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
              zoom: 0,
              pitch: 0,
              center: [41.884579601743276, -87.6279871036212],
              glyphs:
                "https://cdn.jsdelivr.net/gh/piemadd/fonts@a77fb90360c26d9838438c5543026aa3af2a46f5/_output/{fontstack}/{range}.pbf",
              layers: baseStyle,
              bearing: 0,
              sources: {
                protomaps: {
                  type: "vector",
                  tiles: [
                    "https://tilea.piemadd.com/tiles/{z}/{x}/{y}.mvt",
                    "https://tileb.piemadd.com/tiles/{z}/{x}/{y}.mvt",
                    "https://tilec.piemadd.com/tiles/{z}/{x}/{y}.mvt",
                    "https://tiled.piemadd.com/tiles/{z}/{x}/{y}.mvt",
                    //"http://10.0.0.237:8081/tiles/{z}/{x}/{y}.mvt"
                  ],
                  attribution:
                    '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
                  maxzoom: 13,
                },
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
                anchor='bottom'
                longitude={Number(popupInfo.lon)}
                latitude={Number(popupInfo.lat)}
                onClose={() => setPopupInfo(null)}
                offset={{
                  bottom: [0, -24],
                }}
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
