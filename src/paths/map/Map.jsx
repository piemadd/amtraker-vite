import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "./Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import Fuse from "fuse.js";
import { layers, sprite, glyphs } from "./mapLayers.json";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import ManualStationBoxIndependent from "../../components/stationBox/manualStationBoxIndependent.jsx";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import generateMarker from "./MarkerGen.js";
import activatePopup from "./PopupActivation.js";
import ManualTrainPopup from "../../components/trainBox/manualTrainPopup";
import ManualStationPopup from "../../components/stationBox/maualStationPopup.jsx";
import ManualMultiplePopup from "../../components/manualMultiplePopup.jsx";
import settingsInit from "../../components/settingsInit.js";
import ShareButton from "../../components/buttons/shareButton.jsx";
import BaseButton from "../../components/buttons/baseButton.jsx";

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
  const [allIDs, setAllIDs] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [stationsData, setStationsData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");
  const [onlyShowUpcoming, setOnlyShowUpcoming] = useState(false);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [shitsFucked, setShitsFucked] = useState(false);
  const [dataStale, setDataStale] = useState({ avgLastUpdate: 0, activeTrains: 999, stale: false });
  const navigate = useNavigate();
  const location = useLocation();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const setResultsAndRefreshMap = (showAllState, currentQuery) => {
    let actualNewResults = [];

    if (currentQuery.length == 0) {
      actualNewResults = allData;
    } else if (allIDs.includes(currentQuery)) {
      const isAnID = currentQuery.split('-').length > 1;
      actualNewResults = allData.filter((train) => {
        if (train.trainID == currentQuery) return true;
        if (train.trainNum == currentQuery && !isAnID) return true;
        return false;
      });
    } else if (allNames.includes(currentQuery)) {
      actualNewResults = allData.filter((train) => train.routeName == currentQuery);
    } else {
      actualNewResults = fuse.search(currentQuery).map((result) => result.item);
    };

    actualNewResults = actualNewResults.filter((n) => {
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

    // this sometimes errors if someone searches before the map is all there but it doesnt really matter
    mapRef.current.setFilter('trains', finalFilter);
  }

  // navigating popup links
  // i was originally using straight a + hrefs, but safari didnt like it for some reason?
  // fuck you webkit
  useEffect(() => {
    if (location.hash && location.hash.length > 0) {
      if (location.hash.startsWith('#redirect_to')) {
        console.log('Redirecting due to map click:', location.hash.replace('#redirect_to:', ''));
        navigate('#', { replace: true });
        navigate(location.hash.replace('#redirect_to:', ''));
      }
    };
  }, [location]);

  // resizing the map
  useEffect(() => {
    addEventListener("resize", (event) => {
      debounce(setWindowSize([window.innerWidth, window.innerHeight]));
    });
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(allData, {
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
  }, []);

  const savedTrains = useMemo(() => {
    if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
      localStorage.setItem("savedTrainsAmtrakerV3", "");
    }

    const trains = localStorage
      .getItem("savedTrainsAmtrakerV3")
      .split(",")
      .filter((n) => window.dataManager.getTrainExists(n));

    if (trains.length === 0) {
      setShowAll(true);
    };

    return trains;
  }, []);

  const savedTrainsShortID = useMemo(() => {
    if (savedTrains.length === 0) return [];
    return savedTrains.map((n) => `${n.split("-")[0]}-${n.split("-")[2]}`);
  }, [savedTrains]);

  const updateAllData = () => {
    // resetting
    setShitsFucked(false);

    // stale data + shits fucked
    dataManager.getShitsFucked().then((shitsFucked) => setShitsFucked(shitsFucked));
    dataManager.getStaleData().then((stale) => setDataStale(stale));

    // trains
    dataManager.getTrains().then((data) => {
      if (Object.keys(data).length === 0) {
        setShitsFucked(true);
      }

      const allDataNew = Object.values(data).flat();

      setAllData(allDataNew);
      setAllIDs([
        ...allDataNew.map((train) => train.trainID),
        ...allDataNew.map((train) => train.trainNum),
      ]);
      setAllNames(allDataNew.map((train) => train.routeName));
      fuse.setCollection(allDataNew);

      //generating the icons for the trains
      allDataNew.forEach((train) => {
        const { imageWidth, imageHeight, imageText } = generateMarker(train);

        //converting the image and loading it
        const img = new Image(imageWidth, imageHeight);
        img.onload = () => {
          if (mapRef.current.hasImage(train.trainID)) {
            mapRef.current.updateImage(train.trainID, img);
          } else {
            mapRef.current.addImage(train.trainID, img, {
              pixelRatio: 4,
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
  };

  //map initialization
  useEffect(() => {
    try {
      if (mapRef.current) {
        console.log("Map already initialized, not doing that again")
        return;
      }

      console.log('Initializing map')

      // increased workers count test for faster globe loading
      if (appSettings.mapView == 'globe') maplibregl.setWorkerCount(Math.max(Math.min(Math.floor((navigator.hardwareConcurrency ?? 1) / 2), 3), 1));

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
          projection: { "type": appSettings.mapView ?? 'mercator' },
          /*sky: {
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
          },*/
          bearing: 0,
          sources: {
            transit_lines: {
              type: 'vector',
              tiles: [
                "https://v4mapa.amtraker.com/amtraker/{z}/{x}/{y}.mvt",
                "https://v4mapb.amtraker.com/amtraker/{z}/{x}/{y}.mvt",
                "https://v4mapc.amtraker.com/amtraker/{z}/{x}/{y}.mvt",
                "https://v4mapd.amtraker.com/amtraker/{z}/{x}/{y}.mvt"
              ],
              maxzoom: 12,
            },
            protomaps: {
              type: "vector",
              tiles: [
                "https://v4mapa.amtraker.com/20251018/{z}/{x}/{y}.mvt",
                "https://v4mapb.amtraker.com/20251018/{z}/{x}/{y}.mvt",
                "https://v4mapc.amtraker.com/20251018/{z}/{x}/{y}.mvt",
                "https://v4mapd.amtraker.com/20251018/{z}/{x}/{y}.mvt"
              ],
              maxzoom: 15,
            },
            stations: {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: []
              },
            },
            trains: {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [],
              },
            },
          },
          version: 8,
          metadata: {},
        },
        attributionControl: false,
        center: [-97.84139698274907, 41.81914579981135],
        zoom: 3,
        maxZoom: 20,
      });
      window.mapRef = mapRef.current;

      // fetching data on an interval
      setInterval(updateAllData, 30000); // every 30 seconds, update

      //initial data fetch
      // stale data + shits fucked
      dataManager.getShitsFucked().then((shitsFucked) => setShitsFucked(shitsFucked));
      dataManager.getStaleData().then((stale) => setDataStale(stale));

      //starting with stations so theyre on the bottom
      dataManager.getStations().then((data) => {
        if (Object.keys(data).length === 0) {
          setShitsFucked(true);
        }

        const allStations = Object.values(data);

        setStationsData(allStations);

        mapRef.current.on("load", () => {
          //adding data to the map
          mapRef.current.getSource('stations').setData({
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
          });
        });
      });

      dataManager.getTrains().then((data) => {
        if (Object.keys(data).length === 0) {
          setShitsFucked(true);
        }

        const allTrains = Object.values(data).flat();

        setAllData(allTrains);
        setResults(allTrains);
        setAllIDs([
          ...allTrains.map((train) => train.trainID),
          ...allTrains.map((train) => train.trainNum),
        ]);
        setAllNames(allTrains.map((train) => train.routeName));
        if (fuse) fuse.setCollection(allTrains);

        mapRef.current.on("load", () => {
          //adding data to the map
          mapRef.current.getSource('trains').setData({
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

      mapRef.current.on("load", async () => {
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
              maxWidth: false,
            })
              .setLngLat(e.lngLat);

            const finalItems = f.slice(0, 5);
            const hasTrains = finalItems.find((item) => item.layer.id == 'trains');
            const hasStations = finalItems.find((item) => item.layer.id == 'stations');

            let titleText = 'Feature';
            if (hasTrains && !hasStations) titleText = 'Train';
            if (!hasTrains && hasStations) titleText = 'Station';

            setPopupInfo({
              arrayType: 'popup',
              titleText,
              finalItems,
              sourcePopup: popup,
            });
            activatePopup(
              mapRef,
              <ManualMultiplePopup
                finalItems={finalItems}
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
                stations: JSON.parse(feature.properties.stations),
                alerts: JSON.parse(feature.properties.alerts),
              };

              setPopupInfo(train)
              activatePopup(
                mapRef,
                <ManualTrainPopup train={train} />,
                new maplibregl.Popup({
                  offset: 16,
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
        mapRef.current.addControl(new maplibregl.AttributionControl({
          customAttribution: [
            '<a href="https://github.com/protomaps/basemaps" target="_blank">Protomaps</a>',
            '<a href="https://openstreetmap.org" target="_blank">© OpenStreetMap contributors</a>',
            '<a href="https://overturemaps.org" target="_blank">© Overture Maps Foundation</a>',
            '<a href="https://geodata.bts.gov/datasets/usdot::amtrak-routes/about" target="_blank">USDOT BTS</a>',
            '<span>Amtrak</span>',
            '<a href="http://feed.gobrightline.com/" target="_blank">© Brightline</a>',
            '<a href="https://www.viarail.ca/en/developer-resources" target="_blank">© VIA Rail</a>',
            '<a href="https://developer.njtransit.com/terms/" target="_blank">© NJT</a>',
          ].join(' | '),
        }));

        console.log("Map initialized");
      });
    } catch (e) {
      console.log("Error initializing map", e);
    }
  }, []);

  return (
    <>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (query.length > 0) {
                updateQuery("");
                setResultsAndRefreshMap(showAll, "");
                return;
              }

              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className='click noselect'
            style={{ paddingLeft: '32px' }}
          >
            {query.length > 0 ? "Clear Search" : "Back"}
          </h2>
          {shitsFucked ? (
            <p>
              The Amtrak API seems to be having issues currently! Please try
              again later...
            </p>
          ) : dataStale.stale ? (
            <p>Warning: Data is stale. Trains were last updated on average {Math.floor(dataStale.avgLastUpdate / 60000)} minutes ago.</p>
          ) : null}
          <div className="multiButtonHolder">
            <BaseButton
              symbol="?"
              onClick={() => navigate('/about#faq-map-icons-colors')}
              otherCssStyles={{
                height: '75%',
                fontSize: '20px',
                lineHeight: '20px',
                paddingTop: 'calc(0.5em - 2px)'
              }}
            />
            <ShareButton navigatorOptions={{
              title: "Amtraker Map",
              url: "https://amtraker.com/map",
            }} />
            <BaseButton
              symbol="⟳"
              onClick={() => debounce(updateAllData)}
              otherCssStyles={{
                height: '75%',
                fontSize: '20px',
                lineHeight: '20px',
                paddingTop: 'calc(0.5em - 2px)'
              }}
            />
          </div>
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
              {popupInfo && popupInfo.arrayType == 'popup' ? (
                <div
                  style={{
                    marginRight: "8px",
                    display: "flex",
                    flexDirection: 'column',
                    gap: "4px"
                  }}
                >
                  <div className="train-box train-box-max-width">
                    <div className="train-popup__header">Select a {popupInfo.titleText}:</div>
                  </div>
                  {
                    popupInfo.finalItems.map((item) => {
                      switch (item.layer.id) {
                        case 'trains':
                          return (
                            <div
                              key={item.properties.trainID}
                              className="train-box train-box-max-width"
                              style={{
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                const train = {
                                  ...item.properties,
                                  stations: JSON.parse(item.properties.stations),
                                  alerts: JSON.parse(item.properties.alerts),
                                };

                                setPopupInfo(train);
                                popupInfo.sourcePopup.remove();
                                activatePopup(
                                  mapRef,
                                  <ManualTrainPopup train={train} />,
                                  new maplibregl.Popup({
                                    offset: 16,
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
                              }}
                            >
                              <div style={{
                                textWrap: 'nowrap'
                              }}>
                                <span className="status" style={{
                                  backgroundColor: item.properties.iconColor,
                                }}>{item.properties.trainID.split('-')[0]}{!item.properties.onlyOfTrainNum ? ` (${item.properties.trainID.split('-')[1]})` : ''}</span> {item.properties.routeName}
                              </div>
                            </div>
                          )
                        case 'stations':
                          return (
                            <div
                              key={item.properties.code}
                              className="train-box train-box-max-width"
                              style={{
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                const station = {
                                  ...item.properties,
                                  trains: JSON.parse(item.properties.trains)
                                }
                                setPopupInfo(station);
                                popupInfo.sourcePopup.remove();
                                activatePopup(
                                  mapRef,
                                  <ManualStationPopup station={station} />,
                                  new maplibregl.Popup({
                                    offset: 12,
                                    closeButton: true,
                                    anchor: "bottom",
                                  })
                                    .setLngLat([station.lon, station.lat])
                                );
                                if (mapRef.current) {
                                  mapRef.current.flyTo({
                                    center: [station.lon, station.lat],
                                    duration: 500,
                                    zoom: Math.max(mapRef.current.getZoom(), 6)
                                  });
                                }
                              }}
                            >
                              <div>
                                <span className="status">{item.properties.code}</span> {item.properties.name}
                              </div>
                            </div>
                          )
                      }
                    })
                  }
                </div>
              ) : null}
              {popupInfo && popupInfo.trainNum ? (
                <div
                  style={{
                    marginRight: "8px",
                  }}
                >
                  <ManualTrainBox train={popupInfo} maxWidth={true} />
                  {popupInfo.alerts && popupInfo.alerts.length > 0 ? (
                    <details className="train-box train-box-max-width mapalerts" style={{
                      marginTop: '4px',
                      marginBottom: '0px',
                    }}>
                      <summary>Alerts</summary>
                      <ul style={{
                        marginLeft: '24px'
                      }}>
                        {
                          popupInfo.alerts.map((alert, i) => {
                            return <li key={i}>{alert.message}</li>
                          })
                        }
                      </ul>
                    </details>
                  ) : null}
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
              {popupInfo && popupInfo.code ?
                <div
                  className="train-box train-box-max-width"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '1.5rem',
                    fontWeight: '300',
                    width: 'calc(100% - 8px)',
                  }}>
                  <input type="checkbox" onChange={(e) => {
                    console.log(e.target.checked)
                    setOnlyShowUpcoming(e.target.checked)
                  }} />
                  <label><b>Only Show Upcoming</b></label>
                </div> : null}
              {popupInfo && popupInfo.code ? popupInfo.trains
                .map((trainID) => dataManager.getTrainSync(trainID, true))
                .filter((train) => {
                  if (onlyShowUpcoming) {
                    const trainThisStation = train.stations.find((station) => station.code == popupInfo.code);

                    if (!trainThisStation) return true; // still include, but it will be sorted downwards later

                    if (trainThisStation.status != "Enroute") return false;
                  }

                  return true;
                })
                .sort((trainA, trainB) => {
                  if (onlyShowUpcoming) {
                    // getting the stations
                    const trainAThisStation = trainA.stations.find((station) => station.code == popupInfo.code);
                    const trainBThisStation = trainB.stations.find((station) => station.code == popupInfo.code);

                    // managing edge cases
                    if (!trainAThisStation && !trainBThisStation) return trainB.trainID - trainA.trainID; // by train ID
                    if (!trainAThisStation) return 1; // prioritize B
                    if (!trainBThisStation) return -1; // prioritize A

                    //getting time stamps
                    const trainAThisStationTime = new Date(trainAThisStation.arr ?? trainAThisStation.dep);
                    const trainBThisStationTime = new Date(trainBThisStation.arr ?? trainBThisStation.dep);

                    // more edge cases
                    if (!trainAThisStationTime && !trainBThisStationTime) return trainB.trainID - trainA.trainID; // by train ID
                    if (!trainAThisStationTime) return 1; // prioritize B
                    if (!trainBThisStationTime) return -1; // prioritize A

                    return trainAThisStationTime.valueOf() - trainBThisStationTime.valueOf();
                  }

                  return trainB.trainID - trainA.trainID;
                })
                .map((train) => {
                  return (
                    <div
                      style={{
                        marginRight: "8px",
                      }}
                      key={train.trainID}
                    >
                      <ManualTrainBox
                        train={train}
                        maxWidth={true}
                        onClick={() => {
                          dataManager.getTrain(train.trainID)
                            .then((trainData) => {
                              if (Array.isArray(trainData)) return; //no data

                              const thisTrain = trainData[train.trainID.split('-')[0]][0];

                              if (!savedTrainsShortID.includes(thisTrain.trainID)) {
                                mapRef.current.setFilter('trains', ["any", true]);
                                setResults(allData);
                                setShowAll(true);
                              }

                              setPopupInfo(thisTrain);
                              activatePopup(
                                mapRef,
                                <ManualTrainPopup train={thisTrain} />,
                                new maplibregl.Popup({
                                  offset: 16,
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
                        overrideEventCode={popupInfo.code}
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
                      key={train.trainID}
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
                              offset: 16,
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
              {/*
              <div className='attribution'>
                <Link to={"/about#mapdata"}>Map Data Attribution and Copyright</Link>
              </div>
              */}
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

export default AmtrakerMap;