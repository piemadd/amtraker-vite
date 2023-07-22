import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Map, {
  //Layer,
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  //Source,
} from "react-map-gl";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
//import layers from "protomaps-themes-base";
import mapStyle from "./style.json";
import MarkerIcon from "./MarkerIcon.jsx";
import UserMarker from "./UserMarker.svg";
import ManualTrainPopup from "../../components/trainBox/maualTrainPopup";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
//import nationalRoute from "./nationalRoute.json";

//adding pmtiles protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const nationalRouteStyle = {
  id: "data",
  type: "fill",
  paint: {
    color: "#ff0000",
  },
};

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

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const AmtrakerMap = () => {
  const [allData, setAllData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [foamerMode, setFoamerMode] = useState(false);
  const [userLocation, setUserLocation] = useState([0, 0]);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const navigate = useNavigate();

  const mapRef = useRef(null);

  useEffect(() => {
    addEventListener("resize", (event) => {
      debounce(setWindowSize([window.innerWidth, window.innerHeight]));

      //setWindowSize([window.innerWidth, window.innerHeight]);
    });
  }, []);

  //const nationalRouteMemo = useMemo(() => nationalRoute, []);

  useEffect(() => {
    let settings = JSON.parse(localStorage.getItem("amtraker-v3-settings"));
    if (settings) {
      if (settings.foamerMode) {
        setFoamerMode(settings.foamerMode);

        navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          (err) => {
            console.log(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
          }
        );
      } else {
        setFoamerMode(false);
        settings.foamerMode = false;
      }
      localStorage.setItem("amtraker-v3-settings", JSON.stringify(settings));
    } //else is handled by the settings init
  }, []);

  const savedTrains = useMemo(() => {
    if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
      localStorage.setItem("savedTrainsAmtrakerV3", "");
    }

    const trains = localStorage
      .getItem("savedTrainsAmtrakerV3")
      .split(",")
      .filter((n) => n);

    if (trains.length === 0) {
      setShowAll(true);
    }

    return trains;
  }, []);

  const savedTrainsShortID = useMemo(() => {
    if (savedTrains.length === 0) return [];
    return savedTrains.map((n) => `${n.split("-")[0]}-${n.split("-")[2]}`);
  }, [savedTrains]);

  const markers = useMemo(() => {
    return allData
      .filter((n) => {
        if (showAll) return true;
        return savedTrainsShortID.includes(n.trainID);
      })
      .map((train) => {
        if (train.eventCode == "CBN") {
          const stationCodes = train.stations.map((station) => station.code);
          if (stationCodes.indexOf("NFS") < stationCodes.indexOf("NFL")) {
            train.eventCode = "NFL";
          } else {
            train.eventCode = "NFS";
          }
        }

        const currentStation = train.stations.find(
          (station) => station.code === train.eventCode
        );

        if (!currentStation) {
          console.log(train);
          return null;
        }

        const trainStatus = toHoursAndMinutesLate(
          new Date(currentStation.arr ?? currentStation.dep ?? null),
          new Date(currentStation.schArr ?? currentStation.schDep ?? null)
        );

        return (
          <Marker
            latitude={train.lat}
            longitude={train.lon}
            anchor='center'
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
  }, [allData, showAll]);

  useEffect(() => {
    setInterval(() => {
      fetch("https://api-v3.amtraker.com/v3/trains")
        .then((res) => res.json())
        .then((data) => {
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

  /*
  const baseStyleIDs = baseStyle.map((layer) => layer.id);

  layers("protomaps", "dark").forEach((layer) => {
    if (!baseStyleIDs.includes(layer.id)) {
      //baseStyle.push(layer);
    }
  });

  console.log(JSON.stringify(baseStyle));
  */

  return (
    <>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
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
          {windowSize[0] > 800 ? (
            <div className='infoBox'>
              {popupInfo ? (
                <div
                  style={{
                    marginRight: "8px",
                  }}
                >
                  <ManualTrainBox train={popupInfo} maxWidth={true} />
                </div>
              ) : null}
              {popupInfo
                ? popupInfo.stations.map((station, i, arr) => {
                    return (
                      <Link
                        to={`/stations/${station.code}`}
                        key={`station-${station.code}`}
                        className='station-link'
                      >
                        <ManualStationBox station={station} train={popupInfo} />
                      </Link>
                    );
                  })
                : allData
                    .filter((n) => {
                      if (showAll) return true;
                      return savedTrainsShortID.includes(n.trainID);
                    })
                    .map((train) => {
                      return (
                        <div
                          style={{
                            marginRight: "8px",
                          }}
                        >
                          <ManualTrainBox
                            train={train}
                            maxWidth={true}
                            onClick={() => {
                              setPopupInfo(train);
                              if (mapRef.current) {
                                mapRef.current.getMap().flyTo({
                                  center: [train.lon, train.lat],
                                  duration: 500,
                                });
                              }
                            }}
                          />
                        </div>
                      );
                    })}
            </div>
          ) : null}
          <Map
            mapLib={maplibregl}
            ref={mapRef}
            showTileBoundaries={true}
            minZoom={2}
            maxZoom={20}
            initialViewState={{
              latitude: 41.884579601743276,
              longitude: -87.6279871036212,
              zoom: 3,
              pitch: 0,
              bearing: 0,
            }}
            renderWorldCopies={true}
            mapStyle={{
              id: "43f36e14-e3f5-43c1-84c0-50a9c80dc5c7",
              name: "MapLibre",
              zoom: 0,
              pitch: 0,
              center: [41.884579601743276, -87.6279871036212],
              glyphs:
                "https://cdn.jsdelivr.net/gh/piemadd/fonts@54b954f510dc79e04ae47068c5c1f2ee39a69216/_output/{fontstack}/{range}.pbf",
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
                    //"http://10.0.0.237:8081/basemap/{z}/{x}/{y}.mvt"
                  ],
                  maxzoom: 13,
                },
                nationalRoute: {
                  type: "vector",
                  scheme: "tms",
                  tiles: [
                    //"http://10.0.0.207:8081/new/{z}/{x}/{y}.mvt"
                    //"https://tilealt.piemadd.com/nationalRoute/{z}/{y}/{x}.mvt",
                    "https://tilealta.piemadd.com/nationalRoute/{z}/{y}/{x}.mvt",
                    "https://tilealtb.piemadd.com/nationalRoute/{z}/{y}/{x}.mvt",
                    "https://tilealtc.piemadd.com/nationalRoute/{z}/{y}/{x}.mvt",
                    "https://tilealtd.piemadd.com/nationalRoute/{z}/{y}/{x}.mvt",
                  ],
                  maxzoom: 13,
                },
              },
              version: 8,
              metadata: {},
            }}
          >
            {popupInfo && (
              <Popup
                anchor='bottom'
                longitude={Number(popupInfo.lon)}
                latitude={Number(popupInfo.lat)}
                onClose={() => setPopupInfo(null)}
                closeOnClick={true}
                focusAfterOpen={false}
                offset={{
                  bottom: [0, -24],
                }}
              >
                <ManualTrainPopup train={popupInfo} />
              </Popup>
            )}

            {markers}
            <NavigationControl visualizePitch={true} />
            <FullscreenControl />
            {foamerMode ? (
              <Marker
                latitude={userLocation[0]}
                longitude={userLocation[1]}
                anchor='center'
                dsadrotationAlignment='map'
                key={"user-marker"}
                height={"16px"}
              >
                <img
                  src={UserMarker}
                  alt='user'
                  style={{
                    height: "16px",
                  }}
                />
              </Marker>
            ) : null}
            <div className='map-over'>
              <div className='attribution'>
                <a href='https://protomaps.com'>Protomaps</a>
                {" | "}
                <a href='https://openstreetmap.org/copyright'>
                  © OpenStreetMap
                </a>
                {" | "}
                <span>© Amtraker Tiles</span>
              </div>
              <button
                className='settings'
                onClick={() => {
                  setShowAll(!showAll);
                }}
              >
                {showAll ? "Show Saved" : "Show All"}
              </button>
            </div>
          </Map>
        </div>
      </div>
    </>
  );
};

//'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'

export default AmtrakerMap;
