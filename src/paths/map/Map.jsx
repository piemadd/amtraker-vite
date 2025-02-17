import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import Fuse from "fuse.js";
//import layers from "protomaps-themes-base";
//import mapStyle from "./style.json";
import { layers, sprite, glyphs } from "./mapLayers.json";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import ManualStationBoxIndependent from "../../components/stationBox/manualStationBoxIndependent.jsx";
import ShortTrainIDTrainBox from "../../components/trainBox/shortTrainIDTrainBox.jsx";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import generateMarker from "./MarkerGen.js";
import activatePopup from "./PopupActivation.js";
import ManualTrainPopup from "../../components/trainBox/maualTrainPopup";
import ManualStationPopup from "../../components/stationBox/maualStationPopup.jsx";
import ManualMultiplePopup from "../../components/manualMultiplePopup.jsx";
import settingsInit from "../../components/settingsInit.js";

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
  const [stationsData, setStationsData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [shitsFucked, setShitsFucked] = useState(false);
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const setResultsAndRefreshMap = (showAllState, currentQuery) => {
    const actualNewResults = (currentQuery.length > 0
      ? fuse.search(currentQuery).map((result) => result.item)
      : allData).filter((n) => {
        if (showAllState) return true;
        return savedTrainsShortID.includes(n.trainID);
      });

    const finalFilter = showAllState && currentQuery.length == 0 ? // either adding a filter to filter by saved train ids or to allow all trains to be displayed
      ["any", true] :
      ["any", ...actualNewResults
        .map((n) => [
          "==",
          "trainID",
          n.trainID
        ])];

    setResults(actualNewResults);

    mapRef.current.setFilter('trains', finalFilter);
  }

  useEffect(() => {
    addEventListener("resize", (event) => {
      debounce(setWindowSize([window.innerWidth, window.innerHeight]));
    });
  }, []);

  const fuse = new Fuse(allData, {
    keys: [
      "routeName",
      "trainNum",
      "trainID",
      "stations.name",
      "stations.code",
      "stations.city",
      "stations.zip",
    ],
    includeScore: true,
  });

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
    };

    return trains;
  }, []);

  const savedTrainsShortID = useMemo(() => {
    if (savedTrains.length === 0) return [];
    return savedTrains.map((n) => `${n.split("-")[0]}-${n.split("-")[2]}`);
  }, [savedTrains]);

  //map initialization
  useEffect(() => {
    (async () => {
      try {
        if (mapRef.current) {
          console.log("Map already initialized, not doing that again")
          return;
        }

        console.log('Initializing map')
        mapRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          pixelRatio: Math.max(window.devicePixelRatio, 2),
          style: {
            zoom: 0,
            pitch: 0,
            center: [-97.84139698274907, 41.81914579981135],
            glyphs: glyphs,
            sprite: sprite,
            layers: layers,
            projection: { "type": appSettings.mapView ?? 'globe' },
            sky: {
              "sky-color": "#193af3",
              "sky-horizon-blend": 0.5,
              "horizon-color": "#193af3",
              "horizon-fog-blend": 0.5,
              "fog-color": "#ffffff",
              "fog-ground-blend": 0.5,
              "atmosphere-blend": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                0.2,
                5,
                0,
                12,
                0
              ]
            },
            light: {
              anchor: "viewport",
              color: "#88C6FC",
              intensity: 0,
              position: [1, 180, 180]
            },
            bearing: 0,
            sources: {
              protomaps: {
                type: "vector",
                tiles: [
                  "https://v4mapa.transitstat.us/20250127/{z}/{x}/{y}.mvt",
                  "https://v4mapb.transitstat.us/20250127/{z}/{x}/{y}.mvt",
                  "https://v4mapc.transitstat.us/20250127/{z}/{x}/{y}.mvt",
                  "https://v4mapd.transitstat.us/20250127/{z}/{x}/{y}.mvt"
                ],
                maxzoom: 15,
                attribution:
                  "Map Data &copy; OpenStreetMap Contributors | &copy; Transitstatus | &copy; Protomaps",
              },
              transit_lines: {
                type: "vector",
                url: "pmtiles://https://gobbler.transitstat.us/transit.pmtiles",
                maxzoom: 12,
              },
            },
            version: 8,
            metadata: {},
          },
          center: [-97.84139698274907, 41.81914579981135],
          zoom: 3,
          maxZoom: 20,
        });

        mapRef.current.on("load", async () => {
          // fetching data on an interval
          setInterval(() => {
            // trains
            dataManager.getTrains().then((data) => {
              if (Object.keys(data).length === 0) {
                setShitsFucked(true);
              } else {
                setShitsFucked(false);
              }

              setAllData(Object.values(data).flat());
              fuse.setCollection(Object.values(data).flat());

              //generating the icons for the trains
              Object.values(data).flat().forEach((train) => {
                const { imageWidth, imageHeight, imageText } = generateMarker(train);

                //converting the image and loading it
                const img = new Image(imageWidth, imageHeight);
                img.onload = () => {
                  if (mapRef.current.hasImage(train.trainID)) {
                    mapRef.current.updateImage(train.trainID, img, {
                      pixelRatio: 1,
                    });
                  } else {
                    mapRef.current.addImage(train.trainID, img, {
                      pixelRatio: 1,
                    });
                  }
                }
                img.onerror = console.log;
                img.src = "data:image/svg+xml;base64," + btoa(imageText);
              });

              mapRef.current.getSource("trains").setData({
                type: "FeatureCollection",
                features: Object.values(data).flat().map((train) => {
                  return {
                    type: "Feature",
                    id: '',
                    properties: {
                      ...train,
                      id: train.trainID,
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [train.lon, train.lat],
                    },
                  }
                }),
              });
            });

            //stations
            dataManager.getStations().then((data) => {
              if (Object.keys(data).length === 0) {
                setShitsFucked(true);
              } else {
                setShitsFucked(false);
              }

              setStationsData(Object.values(data));

              mapRef.current.getSource("stations").setData({
                type: "FeatureCollection",
                features: Object.values(data).map((station) => {
                  return {
                    type: "Feature",
                    id: station.code,
                    properties: {
                      ...station,
                      id: station.code,
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [station.lon, station.lat],
                    },
                  }
                }),
              });
            });
          }, 30000); // every 30 seconds, update

          //initial data fetch
          //starting with stations so theyre on the bottom
          dataManager.getStations().then((data) => {
            if (Object.keys(data).length === 0) {
              setShitsFucked(true);
            }

            const allStations = Object.values(data);

            setStationsData(allStations);

            //adding data to the map
            mapRef.current.addSource("stations", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: allStations.map((station) => {
                  return {
                    type: "Feature",
                    id: station.code,
                    properties: {
                      ...station,
                      id: station.code,
                      //routeColor: train.lineColor,
                      //lineCode: train.lineCode,
                      //heading: train.heading,
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [station.lon, station.lat],
                    },
                  }
                }),
              },
            });

            //adding the stations layer
            mapRef.current.addLayer({
              id: "stations",
              type: "circle",
              source: "stations",
              minzoom: 6,
              layout: {},
              paint: {
                "circle-pitch-alignment": "map",
                "circle-radius": 6,
                "circle-stroke-width": 2,
                "circle-color": "#ffffff",
                "circle-stroke-color": "#000000",
              },
            });

            mapRef.current.addLayer({
              id: "stations_label",
              type: "symbol",
              source: "stations",
              minzoom: 7,
              layout: {
                "text-field": ["get", "code"],
                "text-font": ["Noto Sans Regular"],
                "text-offset": [0, 1.25],
                "text-allow-overlap": true,
              },
              paint: {
                "text-color": "#ffffff",
                "text-halo-color": "#000000",
                "text-halo-width": 1,
              },
            });



            //now getting the trains after the stations are added so they go on top
            dataManager.getTrains().then((data) => {
              if (Object.keys(data).length === 0) {
                setShitsFucked(true);
              }

              const allTrains = Object.values(data).flat();

              setAllData(allTrains);
              setResults(allTrains);

              //adding data to the map
              mapRef.current.addSource("trains", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: allTrains.map((train) => {
                    return {
                      type: "Feature",
                      id: train.trainID,
                      properties: {
                        ...train,
                        id: train.trainID,
                        //routeColor: train.lineColor,
                        //lineCode: train.lineCode,
                        //heading: train.heading,
                      },
                      geometry: {
                        type: "Point",
                        coordinates: [train.lon, train.lat],
                      },
                    }
                  }),
                },
              });

              //generating the icons for the trains
              allTrains.forEach((train) => {
                const { imageWidth, imageHeight, imageText } = generateMarker(train);

                //converting the image and loading it
                const img = new Image(imageWidth, imageHeight);
                img.onload = () => mapRef.current.addImage(train.trainID, img, {
                  pixelRatio: 4,
                });
                img.onerror = console.log;
                img.src = "data:image/svg+xml;base64," + btoa(imageText);
              });

              //adding the trains layer
              mapRef.current.addLayer({
                id: "trains",
                type: "symbol",
                source: "trains",
                layout: {
                  "icon-image": ["get", "trainID"],
                  //"icon-rotation-alignment": "map",
                  "icon-size": 1,
                  "icon-allow-overlap": true,
                },
                paint: {},
                filter: savedTrains.length == 0 ?
                  ["any", true] :
                  ["any", ...allTrains
                    .filter((n) => savedTrainsShortID.includes(n.trainID))
                    .map((n) => [
                      "==",
                      "trainID",
                      n.trainID
                    ])]
              });
            });
          });

          mapRef.current.on("click", (e) => {
            let f = mapRef.current.queryRenderedFeatures(e.point, {
              layers: ["trains", "stations"],
            });

            if (f.length === 0) {
              setPopupInfo(null);
              return;
            }

            if (mapRef.current.getZoom() < 6) f = f.filter((n) => n.layer.id == 'trains');

            if (f.length > 1) {
              const popup = new maplibregl.Popup({
                offset: 16,
                closeButton: true,
                anchor: "bottom",
              })
                .setLngLat(e.lngLat);
              setPopupInfo({
                arrayType: 'popup',
                features: f,
              });
              activatePopup(
                mapRef,
                <ManualMultiplePopup
                  items={f}
                  mapRef={mapRef}
                  setPopupInfo={setPopupInfo}
                  sourcePopup={popup}
                />,
                popup
              )
              return;
            }

            const feature = f[0];

            switch (feature.layer.id) {
              case 'trains':
                const train = {
                  ...feature.properties,
                  stations: JSON.parse(feature.properties.stations)
                };
                setPopupInfo(train)
                activatePopup(
                  mapRef,
                  <ManualTrainPopup train={train} />,
                  new maplibregl.Popup({
                    offset: 32,
                    closeButton: true,
                    anchor: "bottom",
                  })
                    .setLngLat(feature.geometry.coordinates)
                )
                break;
              case 'stations':
                const station = {
                  ...feature.properties,
                  trains: JSON.parse(feature.properties.trains)
                }
                setPopupInfo(station)
                activatePopup(
                  mapRef,
                  <ManualStationPopup station={station} />,
                  new maplibregl.Popup({
                    offset: 12,
                    closeButton: true,
                    anchor: "bottom",
                  })
                    .setLngLat(feature.geometry.coordinates)
                )
                break;
            }
          });

          mapRef.current.on("mouseenter", "trains", () => {
            mapRef.current.getCanvas().style.cursor = "pointer";
          });

          mapRef.current.on("mouseleave", "trains", () => {
            mapRef.current.getCanvas().style.cursor = "";
          });

          mapRef.current.on("mouseenter", "stations", () => {
            mapRef.current.getCanvas().style.cursor = "pointer";
          });

          mapRef.current.on("mouseleave", "stations", () => {
            mapRef.current.getCanvas().style.cursor = "";
          });

          mapRef.current.on("moveend", () => {
            console.log(
              `Map moved to ${mapRef.current.getCenter()} with zoom ${mapRef.current.getZoom()}`
            );
          });

          mapRef.current.addControl(
            new maplibregl.NavigationControl({
              visualizePitch: true,
            }),
            "top-right"
          );
          mapRef.current.addControl(new maplibregl.FullscreenControl());
          mapRef.current.addControl(
            new maplibregl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true,
              },
              trackUserLocation: true,
            })
          );

          console.log("Map initialized");
        });
      } catch (e) {
        console.log("Error initializing map", e);
      }
    })();
  }, []);

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
          {shitsFucked ? (
            <p>
              The Amtrak API seems to be having issues currently! Please try
              again later...
            </p>
          ) : null}
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
              {!popupInfo ? (
                <input
                  type='text'
                  value={query}
                  placeholder='Search...'
                  style={{
                    width: "100%",
                    padding: "8px",
                  }}
                  onChange={(e) => {
                    updateQuery(e.target.value);
                    debounce(
                      setResultsAndRefreshMap(showAll, e.target.value)
                    );
                  }}
                />
              ) : null}
              {popupInfo && popupInfo.trainNum ? (
                <div
                  style={{
                    marginRight: "8px",
                  }}
                >
                  <ManualTrainBox train={popupInfo} maxWidth={true} />
                </div>
              ) : null}
              {popupInfo && popupInfo.code ? (
                <div
                  style={{
                    marginRight: "8px",
                  }}
                >
                  <ManualStationBoxIndependent station={popupInfo} maxWidth={true} />
                </div>
              ) : null}
              {popupInfo && popupInfo.trainNum ? popupInfo.stations.map((station, i, arr) => {
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
                : null}
              {popupInfo && popupInfo.code ? popupInfo.trains
                .map((trainID) => {
                  return (
                    <div
                      style={{
                        marginRight: "8px",
                      }}
                    >
                      <ShortTrainIDTrainBox
                        trainID={trainID}
                        maxWidth={true}
                        onClick={() => {
                          dataManager.getTrain(trainID)
                            .then((trainData) => {
                              if (Array.isArray(trainData)) return; //no data

                              const train = trainData[trainID.split('-')[0]][0];

                              if (!savedTrainsShortID.includes(train.trainID)) {
                                mapRef.current.setFilter('trains', ["any", true]);
                                setResults(allData);
                                setShowAll(true);
                              }

                              setPopupInfo(train);
                              activatePopup(
                                mapRef,
                                <ManualTrainPopup train={train} />,
                                new maplibregl.Popup({
                                  offset: 32,
                                  closeButton: true,
                                  anchor: "bottom",
                                })
                                  .setLngLat([train.lon, train.lat])
                              )
                              if (mapRef.current) {
                                mapRef.current.flyTo({
                                  center: [train.lon, train.lat],
                                  duration: 500,
                                  zoom: Math.max(mapRef.current.getZoom(), 6)
                                });
                              }
                            })
                        }}
                      />
                    </div>
                  );
                })
                : null}
              {!popupInfo ? results
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
                          activatePopup(
                            mapRef,
                            <ManualTrainPopup train={train} />,
                            new maplibregl.Popup({
                              offset: 32,
                              closeButton: true,
                              anchor: "bottom",
                            })
                              .setLngLat([train.lon, train.lat])
                          )
                          if (mapRef.current) {
                            mapRef.current.flyTo({
                              center: [train.lon, train.lat],
                              duration: 500,
                              zoom: 6
                            });
                          }
                        }}
                      />
                    </div>
                  );
                }) : null}
            </div>
          ) : null}
          <div
            ref={mapContainerRef}
            className='map maplibregl-map'
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              backgroundColor: "#004173",
            }}
          >
            <div className='map-over'>
              <div className='attribution'>
                <a href='https://protomaps.com' target='_blank'>
                  &copy; Protomaps Tiles
                </a>
                {" | "}
                <a href='https://openstreetmap.org/copyright' target='_blank'>
                  &copy; OpenStreetMap
                </a>
              </div>
              <button
                className='settings'
                onClick={() => {
                  const currentShowAll = showAll;
                  setShowAll(!currentShowAll);
                  setResultsAndRefreshMap(!currentShowAll, query);
                }}
              >
                {showAll ? "Show Saved" : "Show All"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

//'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'

export default AmtrakerMap;