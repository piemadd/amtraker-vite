import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Marker,
} from "react-map-gl";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import Fuse from "fuse.js";
import mapLayers from "./mapLayers.json";
import MarkerIcon from "./MarkerIcon.jsx";
import ManualTrainPopup from "../../components/trainBox/maualTrainPopup.jsx";
import ManualStationBox from "../../components/stationBox/manualStationBox.jsx";
import ManualTrainBox from "../../components/trainBox/manualTrainBox.jsx";

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
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [lng] = useState(-97.90737612898533);
  const [lat] = useState(39.60341663773312);
  const [zoom] = useState(3);
  const [shitsFucked, setShitsFucked] = useState(false);
  const navigate = useNavigate();
  const dataManager = window.dataManager;

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
    }

    return trains;
  }, []);

  const savedTrainsShortID = useMemo(() => {
    if (savedTrains.length === 0) return [];
    return savedTrains.map((n) => `${n.split("-")[0]}-${n.split("-")[2]}`);
  }, [savedTrains]);

  const markers = useMemo(() => {
    return results
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
  }, [allData, showAll, results]);

  //initializing the map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        zoom: 0,
        pitch: 0,
        center: [41.884579601743276, -87.6279871036212],
        glyphs:
          "https://fonts.transitstat.us/_output/{fontstack}/{range}.pbf",
        sprite: "https://osml.transitstat.us/sprites/osm-liberty",
        layers: mapLayers,
        projection: { "type": "globe" },
        sky: {
          "sky-color": "#199EF3",
          "sky-horizon-blend": 0.5,
          "horizon-color": "#ffffff",
          "horizon-fog-blend": 0.5,
          "fog-color": "#0000ff",
          "fog-ground-blend": 0.5,
          "atmosphere-blend": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
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
              "https://tilea.transitstat.us/tiles/{z}/{x}/{y}.mvt",
              "https://tileb.transitstat.us/tiles/{z}/{x}/{y}.mvt",
              "https://tilec.transitstat.us/tiles/{z}/{x}/{y}.mvt",
              "https://tiled.transitstat.us/tiles/{z}/{x}/{y}.mvt",
            ],
            maxzoom: 15,
          },
          natural_earth_shaded_relief: {
            maxzoom: 6,
            tileSize: 256,
            tiles: [
              "https://naturalearthtiles.transitstat.us/{z}/{x}/{y}.png",
            ],
            type: "raster",
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
      center: [lng, lat],
      zoom: zoom,
      maxZoom: 20,
      attributionControl: false,
    });

    //BEGIN SECTION
    map.current.on("load", async () => {
      const stationsData = await window.dataManager.getData(agency, "stations");
      const trainsData = await window.dataManager.getData(agency, "trains");
      const linesData = await window.dataManager.getData(agency, "lines");

      window.dataManager.getData(agency, "lastUpdated").then((ts) => {
        setLastUpdated(new Date(ts));
        setIsLoading(false);
      });

      let fullMapShapes = {
        type: "FeatureCollection",
        features: [],
      };
      const mapShapeURLs = agencies[agency].mapShapes;

      for (let i = 0; i < mapShapeURLs.length; i++) {
        const mapShapes = await fetch(mapShapeURLs[i]);
        const mapShapesData = await mapShapes.json();

        fullMapShapes.features.push(
          ...mapShapesData.features.filter((feature) => {
            if (singleRouteID === "all") return true;
            if (agencies[agency].dontFilterMapLines) return true;
            if (feature.properties.routeID === singleRouteID) return true;
            if (feature.properties.routeLongName === singleRouteID)
              return true;
            return false;
          })
        );
      }

      map.current.addSource("shapes", {
        type: "geojson",
        data: fullMapShapes,
      });

      map.current.addLayer({
        id: "shapes-under",
        type: "line",
        source: "shapes",
        layout: {
          "line-join": "round",
          "line-round-limit": 0.1,
        },
        paint: {
          "line-color": "#222222",
          "line-opacity": 1,
          "line-width": 4,
        },
      });

      map.current.addLayer({
        id: "shapes",
        type: "line",
        source: "shapes",
        layout: {
          "line-join": "round",
          "line-round-limit": 0.1,
        },
        paint: {
          "line-color": ["get", "routeColor"],
          "line-opacity": 1,
          "line-width": 2,
        },
      });

      let minLat = 90;
      let maxLat = -90;
      let minLon = 180;
      let maxLon = -180;

      map.current.addSource("stations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Object.keys(stationsData)
            .filter((station) => {
              if (singleRouteID === "all") return true;

              const line = linesData[singleRouteID];

              //oopsies!
              if (!line) return false;

              if (line.stations.includes(station)) return true;

              return false;
            })
            .map((stationId) => {
              const station = stationsData[stationId];

              if (station.lat !== 0 && station.lon !== 0) {
                if (station.lat < minLat) minLat = station.lat;
                if (station.lat > maxLat) maxLat = station.lat;
                if (station.lon < minLon) minLon = station.lon;
                if (station.lon > maxLon) maxLon = station.lon;
              }

              return {
                type: "Feature",
                id: stationId,
                properties: {
                  id: stationId,
                  name: station.stationName,
                  stationData: station,
                },
                geometry: {
                  type: "Point",
                  coordinates: [station.lon, station.lat],
                },
              };
            }),
        },
      });

      setInterval(() => {
        window.dataManager.getData(agency, "stations").then((data) => {
          map.current.getSource("stations").setData({
            type: "FeatureCollection",
            features: Object.keys(data)
              .filter((station) => {
                if (singleRouteID === "all") return true;

                const line = linesData[singleRouteID];

                //oopsies!
                if (!line) return false;

                if (line.stations.includes(station)) return true;

                return false;
              })
              .map((stationId) => {
                const station = data[stationId];

                return {
                  type: "Feature",
                  id: stationId,
                  properties: {
                    id: stationId,
                    name: station.stationName,
                    stationData: station,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [station.lon, station.lat],
                  },
                };
              }),
          });

          window.dataManager.getData(agency, "lastUpdated").then((ts) => {
            setLastUpdated(new Date(ts));
          });

          console.log("Updated stations data");

          //stationsSource.
        });
      }, 1000 * 30);

      map.current.addLayer({
        id: "stations",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": 4,
          "circle-color": "#fff",
          "circle-stroke-color": "#000",
          "circle-stroke-width": 1,
        },
      });

      let finalFeaturesInitial = [];

      Object.keys(trainsData).forEach((trainId) => {
        const train = trainsData[trainId];

        if (train.lineCode !== singleRouteID && singleRouteID !== "all")
          return;

        if (train.lat !== 0 && train.lon !== 0) {
          if (train.lat < minLat) minLat = train.lat;
          if (train.lat > maxLat) maxLat = train.lat;
          if (train.lon < minLon) minLon = train.lon;
          if (train.lon > maxLon) maxLon = train.lon;
        }

        finalFeaturesInitial.push({
          type: "Feature",
          id: trainId,
          properties: {
            ...train,
            id: trainId,
            routeColor: train.lineColor,
            lineCode: train.lineCode,
            heading: train.heading,
          },
          geometry: {
            type: "Point",
            coordinates: [train.lon, train.lat],
          },
        });
      });

      console.log(finalFeaturesInitial);

      map.current.addSource("trains", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: finalFeaturesInitial,
        },
      });

      if (
        minLat !== 90 &&
        maxLat !== -90 &&
        minLon !== 180 &&
        maxLon !== -180
      ) {
        map.current.fitBounds(
          [
            [minLon, minLat],
            [maxLon, maxLat],
          ],
          {
            padding: 50,
            maxZoom: agencies[agency].autoFitMaxZoom ?? 14,
          }
        );
      }

      setInterval(() => {
        window.dataManager.getData(agency, "trains").then((data) => {
          let finalFeatures = [];

          Object.keys(data).forEach((trainId) => {
            const train = data[trainId];

            if (
              train.lineCode === singleRouteID ||
              singleRouteID === "all"
            ) {
              finalFeatures.push({
                type: "Feature",
                id: trainId,
                properties: {
                  ...train,
                  id: trainId,
                  routeColor: train.lineColor,
                  lineCode: train.lineCode,
                  heading: train.heading,
                },
                geometry: {
                  type: "Point",
                  coordinates: [train.lon, train.lat],
                },
              });
            }
          });

          map.current.getSource("trains").setData({
            type: "FeatureCollection",
            features: finalFeatures,
          });

          console.log("Updated trains data");
        });
      }, 1000 * 10);

      const startTime = Date.now();

      //setting up icon type and size
      const shapeToUse = agencies[agency].showArrow ? "arrow" : "circle";
      const iconSize = agencies[agency].showArrow ? 120 : 48;
      let existingIcons = {};

      Object.keys(linesData).forEach((lineKey) => {
        const line = linesData[lineKey];

        if (existingIcons[line.routeColor]) return; // no need to generate twice

        //filling in the template
        const iconText = mapIconTemplates[shapeToUse]
          .replaceAll("FILL", `#${line.routeColor}`)
          .replaceAll("BORDERS", `#${line.routeTextColor}`);

        //converting the image and loading it
        const img = new Image(iconSize, iconSize);
        img.onload = () =>
          map.current.addImage(line.routeColor, img, {
            pixelRatio: 1,
          });
        img.onerror = console.log;
        img.src = "data:image/svg+xml;base64," + btoa(iconText);

        existingIcons[line.routeColor] = true;

        //console.log(mapIconTemplates);
      });

      console.log(`Done with generating icons in ${Date.now() - startTime}ms`)
      console.log(`Total number of icons: ${Object.keys(existingIcons).length}`)

      map.current.addLayer({
        id: "trains",
        type: "symbol",
        source: "trains",
        layout: {
          "icon-image": ["get", "routeColor"],
          "icon-rotation-alignment": "map",
          "icon-size": 0.4,
          "icon-rotate": ["get", "heading"],
          "icon-allow-overlap": true,
          "text-font": ["Open Sans Regular"],
        },
        paint: {},
      });

      map.current.on("click", (e) => {
        let f = map.current.queryRenderedFeatures(e.point, {
          layers: ["trains", "stations"],
        });

        if (f.length === 0) return;

        const fSorted = f.sort((a, b) => {
          if (a.layer.id === "trains") return 1;
          if (b.layer.id === "trains") return -1;
          return 0;
        });

        const feature = fSorted[0];

        if (feature.layer.id === "trains") {
          const train = feature.properties;
          const coordinates = feature.geometry.coordinates.slice();

          let predictionsHTML = "";

          JSON.parse(train.predictions)
            .sort((a, b) => a.actualETA - b.actualETA)
            .filter((eta) => eta.actualETA >= Date.now() - (1000 * 60 * 5))
            .slice(0, 5)
            .forEach((prediction) => {
              console.log("prediction", prediction);
              predictionsHTML += `<p class='mapTrainBar' style='color: #${train.lineTextColor
                }; background-color: #${train.lineColor};'><strong>${prediction.stationName
                }</strong><strong>${prediction.noETA
                  ? "No ETA"
                  : hoursMinutesUntilArrival(new Date(prediction.actualETA))
                }</strong></p>`;
            });

          const extra = train.extra ? JSON.parse(train.extra) : null;

          const trainPopup = new maplibregl.Popup({
            offset: 12,
            closeButton: true,
            anchor: "bottom",
          })
            .setLngLat(coordinates)
            .setHTML(
              `<div class='mapBar'><h3>${agencies[agency].useCodeForShortName
                ? train.lineCode
                : train.line
              }${agencies[agency].addLine ? " Line " : " "}#${train.id
              } to ${train.dest}</h3>${extra && (extra.cap || extra.info)
                ? `<p style='margin-top: -2px;padding-bottom: 4px;'>${extra.info ?? ""
                }${extra.cap && extra.info ? " | " : ""}${extra.cap
                  ? `${Math.ceil(
                    (extra.load / extra.cap) * 100
                  )}% Full`
                  : ""
                }</p>`
                : ""
              }${predictionsHTML}<p class='mapTrainBar' style='color: #${train.lineTextColor
              }; background-color: #${train.lineColor
              };'><strong><a style='color: #${train.lineTextColor
              }; background-color: #${train.lineColor
              };' href='/${agency}/track/${train.id}?prev=map'>View Full ${agencies[agency].type
              }</a></strong></p></div>`
            )
            .addTo(map.current);
        } else if (feature.layer.id === "stations") {
          const station = JSON.parse(feature.properties.stationData);
          const coordinates = feature.geometry.coordinates.slice();

          let finalHTML = `<div class='mapBar'><h3>${station.stationName}</h3>`;

          let noTrainsAtAll = true;

          Object.keys(station.destinations).forEach((destKey) => {
            const dest = station.destinations[destKey];
            let destHasLineTrains = false;

            dest.trains.forEach((train) => {
              if (
                (train.lineCode === singleRouteID ||
                  singleRouteID === "all") && train.actualETA >= Date.now() - (1000 * 60 * 5)
              ) {
                destHasLineTrains = true;
              }
            });

            if (dest.trains.length === 0 || !destHasLineTrains) {
              //finalHTML += `<p class='mapTrainBar'>No trains tracking</p>`;
            } else {
              noTrainsAtAll = false;
              finalHTML += `<p class='mapStationBar'>To <strong>${destKey}</strong></p>`;
              dest.trains
                .filter(
                  (train) =>
                    (train.lineCode === singleRouteID ||
                      singleRouteID === "all") &&
                    !train.noETA
                )
                .sort((a, b) => a.actualETA - b.actualETA)
                .filter((eta) => eta.actualETA >= Date.now() - (1000 * 60 * 5))
                .slice(0, 3)
                .forEach((train) => {
                  finalHTML += `<p class='mapTrainBar' style='color: #${train.lineTextColor
                    }; background-color: #${train.lineColor
                    };'><span><strong>${agencies[agency].useCodeForShortName
                      ? train.lineCode
                      : train.line
                    }${agencies[agency].addLine ? " Line " : " "}</strong>${agencies[agency].tripIDPrefix
                    }${train.runNumber
                    } to <strong>${destKey}</strong></span><strong>${train.noETA
                      ? "No ETA"
                      : hoursMinutesUntilArrival(new Date(train.actualETA))
                    }</strong></p>`;
                });
            }
          });

          if (noTrainsAtAll) {
            finalHTML += `<p class='mapTrainBar'>No ${agencies[agency].typeCodePlural} tracking</p>`;
          }

          finalHTML += `<p class='mapStationBar' style='color: ${agencies[agency].textColor}; background-color: ${agencies[agency].color};'><strong><a style='color: ${agencies[agency].textColor}; background-color: ${agencies[agency].color};' href='/${agency}/stops/${station.stationID}?prev=map'>View Full Station</a></strong></p></div>`;

          const stationPopup = new maplibregl.Popup({
            offset: 12,
            closeButton: true,
            anchor: "bottom",
          })
            .setLngLat(coordinates)
            .setHTML(finalHTML)
            .addTo(map.current);
        }
      });

      map.current.on("mouseenter", "stations", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "stations", () => {
        map.current.getCanvas().style.cursor = "";
      });

      map.current.on("mouseenter", "trains", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "trains", () => {
        map.current.getCanvas().style.cursor = "";
      });

      map.current.on("moveend", () => {
        console.log(
          `Map moved to ${map.current.getCenter()} with zoom ${map.current.getZoom()}`
        );
      });

      map.current.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );
      map.current.addControl(new maplibregl.FullscreenControl());
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );

      console.log("Map initialized");
    });
    //END SECTION

    setInterval(() => {
      dataManager.getTrains().then((data) => {
        if (Object.keys(data).length === 0) {
          setShitsFucked(true);
        }

        setShitsFucked(false);

        setAllData(JSON.parse(JSON.stringify(Object.values(data).flat())));
        fuse.setCollection(Object.values(data).flat());
      });
    }, 30000);

    dataManager.getTrains().then((data) => {
      if (Object.keys(data).length === 0) {
        setShitsFucked(true);
      }

      setAllData(Object.values(data).flat());
      setResults(Object.values(data).flat());
    });
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
              {popupInfo ? (
                <div
                  style={{
                    marginRight: "8px",
                  }}
                >
                  <ManualTrainBox train={popupInfo} maxWidth={true} />
                </div>
              ) : (
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
                      setResults(
                        e.target.value.length > 0
                          ? fuse
                            .search(e.target.value)
                            .map((result, i) => result.item)
                          : allData.filter((n) => {
                            if (showAll) return true;
                            return savedTrainsShortID.includes(n.trainID);
                          })
                      )
                    );
                  }}
                />
              )}
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
                : results
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
          <div
            ref={mapContainer}
            className='maplibregl-map'
            style={{
              width: '100%',
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
                  setResults(
                    query.length > 0
                      ? fuse.search(query).map((result, i) => result.item)
                      : allData.filter((n) => {
                        if (!currentShowAll) return true;
                        return savedTrainsShortID.includes(n.trainID);
                      })
                  );
                }}
              >
                {showAll ? "Show Saved" : "Show All"}
              </button>
            </div>
          </div>
          {/*}
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
            attributionControl={false}
            renderWorldCopies={true}
            mapStyle={{
              zoom: 0,
              pitch: 0,
              center: [41.884579601743276, -87.6279871036212],
              glyphs:
                "https://fonts.transitstat.us/_output/{fontstack}/{range}.pbf",
              sprite: "https://osml.transitstat.us/sprites/osm-liberty",
              layers: mapLayers, //layers("protomaps", "dark"),
              projection: { "type": "globe" },
              sky: {
                "sky-color": "#199EF3",
                "sky-horizon-blend": 0.5,
                "horizon-color": "#ffffff",
                "horizon-fog-blend": 0.5,
                "fog-color": "#0000ff",
                "fog-ground-blend": 0.5,
                "atmosphere-blend": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    1,
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
                    "https://tilea.transitstat.us/tiles/{z}/{x}/{y}.mvt",
                    "https://tileb.transitstat.us/tiles/{z}/{x}/{y}.mvt",
                    "https://tilec.transitstat.us/tiles/{z}/{x}/{y}.mvt",
                    "https://tiled.transitstat.us/tiles/{z}/{x}/{y}.mvt",
                  ],
                  maxzoom: 15,
                },
                natural_earth_shaded_relief: {
                  maxzoom: 6,
                  tileSize: 256,
                  tiles: [
                    "https://naturalearthtiles.transitstat.us/{z}/{x}/{y}.png",
                  ],
                  type: "raster",
                },
                transit_lines: {
                  type: "vector",
                  url: "pmtiles://https://gobbler.transitstat.us/transit.pmtiles",
                  maxzoom: 12,
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
            <GeolocateControl />
          </Map>
          {*/}
        </div>
      </div>
    </>
  );
};

//'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'

export default AmtrakerMap;
