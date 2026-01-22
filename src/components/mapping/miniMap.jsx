import React, { useEffect, useState, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "../../paths/map/Map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { layers, sprite, glyphs } from "../../paths/map/mapLayers.json";
import generateMarker from "../../paths/map/MarkerGen.js";
import activatePopup from "../../paths/map/PopupActivation.js";
import ManualTrainPopup from "../trainBox/manualTrainPopup.jsx";
import ManualStationPopup from "../stationBox/maualStationPopup.jsx";
import ManualMultiplePopup from "../manualMultiplePopup.jsx";
import settingsInit from "../settingsInit.js";
import { Link } from "react-router-dom";

const MiniMap = ({ filteredTrainIDs = [], filteredStationCodes = [], zoomToTrains = false, zoomToStations = false, idLinkType = null }) => {
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const updateAllData = () => {
    // trains
    dataManager.getTrains().then((data) => {
      const allDataNew = Object.values(data).flat();

      //generating the icons for the trains
      allDataNew.forEach((train) => {
        const { imageWidth, imageHeight, imageText } = generateMarker(train);

        //converting the image and loading it
        const img = new Image(imageWidth, imageHeight);
        img.onload = () => {
          try {
            if (mapRef.current.hasImage(train.trainID)) {
              mapRef.current.updateImage(train.trainID, img);
            } else {
              mapRef.current.addImage(train.trainID, img, {
                pixelRatio: 4,
              });
            }
          } catch (e) { // different sized image
            mapRef.current.removeImage(train.trainID); mapRef.current.addImage(train.trainID, img, {
              pixelRatio: 4,
            });
          }
        }
        img.onerror = console.log;
        img.src = "data:image/svg+xml;base64," + btoa(imageText);
      });

      mapRef.current.getSource("trains").setData({
        type: "FeatureCollection",
        features: Object.values(data)
          .flat()
          .filter((n) => filteredTrainIDs.includes(n.trainID))
          .map((train) => {
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
      mapRef.current.getSource("stations").setData({
        type: "FeatureCollection",
        features: Object.values(data)
          .filter((station) => filteredStationCodes.includes(station.code))
          .map((station) => {
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
      setInterval(updateAllData, 10000); // every 10 seconds, update

      //initial data fetch
      const pointsToBoundTo = [];
      const zoomToPointBounds = () => {
        if (pointsToBoundTo.length == 0) return;
        else if (pointsToBoundTo.length == 1) {
          mapRef.current.flyTo({
            center: pointsToBoundTo[0],
            duration: 500,
            zoom: 9,
          });
        } else {
          const bbox = new maplibregl.LngLatBounds();
          for (let i = 0; i < pointsToBoundTo.length; i++) bbox.extend(pointsToBoundTo[i]);
          if (!bbox.isEmpty()) mapRef.current.fitBounds(bbox, { padding: 16 });
        }
      };

      //starting with stations so theyre on the bottom
      dataManager.getStations().then((data) => {
        const allStations = Object.values(data);

        mapRef.current.on("load", () => {
          //adding data to the map
          mapRef.current.setLayerZoomRange('stations', 0);
          mapRef.current.setLayerZoomRange('stations_label', 5);

          mapRef.current.getSource('stations').setData({
            type: "FeatureCollection",
            features: allStations
              .filter((station) => filteredStationCodes.includes(station.code))
              .map((station) => {
                if (zoomToStations) pointsToBoundTo.push([station.lon, station.lat]);

                return {
                  type: "Feature",
                  id: station.code,
                  properties: {
                    ...station,
                    id: station.code
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [station.lon, station.lat],
                  },
                }
              }),
          });

          zoomToPointBounds();
        });
      });

      dataManager.getTrains().then((data) => {
        const allTrains = Object.values(data).flat();

        mapRef.current.on("load", () => {
          //adding data to the map
          mapRef.current.getSource('trains').setData({
            type: "FeatureCollection",
            features: allTrains
              .filter((n) => filteredTrainIDs.includes(n.trainID))
              .map((train) => {
                if (zoomToTrains) pointsToBoundTo.push([train.lon, train.lat]);

                return {
                  type: "Feature",
                  id: train.trainID,
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
            paint: {}
          });

          zoomToPointBounds();
        });
      });

      mapRef.current.on("load", async () => {
        mapRef.current.on("click", (e) => {
          const bbox = [
            [e.point.x - 4, e.point.y - 4], // southwest
            [e.point.x + 4, e.point.y + 4], // northeast
          ];

          let f = mapRef.current.queryRenderedFeatures(bbox, {
            layers: ["trains", "stations"],
          });

          if (f.length === 0) return;

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

            activatePopup(
              mapRef,
              <ManualMultiplePopup
                finalItems={finalItems}
                mapRef={mapRef}
                setPopupInfo={(item) => {
                  const targetElement = document.getElementById(item.code ?? item.trainID);
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                    targetElement.children[0].animate(
                      [
                        { filter: 'brightness(1)', backgroundColor: null },
                        { filter: 'brightness(1.5)', backgroundColor: '#555' }
                      ],
                      {
                        duration: 200,
                        easing: 'ease-in-out',
                        iterations: 4, // in and out
                        direction: 'alternate'
                      }
                    );
                  }
                }}
                sourcePopup={popup}
                showLink={false}
              //idLinkType={idLinkType}
              />,
              popup
            )
            return;
          }

          const feature = f[0];
          let targetElement = null;

          switch (feature.layer.id) {
            case 'trains':
              const train = {
                ...feature.properties,
                stations: JSON.parse(feature.properties.stations),
                alerts: JSON.parse(feature.properties.alerts),
              };

              targetElement = document.getElementById(train.trainID);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
                targetElement.children[0].animate(
                  [
                    { filter: 'brightness(1)', backgroundColor: null },
                    { filter: 'brightness(1.5)', backgroundColor: '#555' }
                  ],
                  {
                    duration: 200,
                    easing: 'ease-in-out',
                    iterations: 4, // in and out
                    direction: 'alternate'
                  }
                );
              }

              activatePopup(
                mapRef,
                <ManualTrainPopup train={train} showLink={false} idLink={idLinkType == 'train'} />,
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

              targetElement = document.getElementById(station.code);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
                targetElement.children[0].animate(
                  [
                    { filter: 'brightness(1)', backgroundColor: null },
                    { filter: 'brightness(1.5)', backgroundColor: '#555' }
                  ],
                  {
                    duration: 200,
                    easing: 'ease-in-out',
                    iterations: 4, // in and out
                    direction: 'alternate'
                  }
                );
              }
              activatePopup(
                mapRef,
                <ManualStationPopup station={station} showLink={false} idLink={idLinkType == 'station'} />,
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
            '<a href="https://metrolinktrains.com/about/gtfs/gtfs-rt-access/" target="_blank">© LA Metrolink</a>',
            '<a href="https://moynihantrainhall.nyc/" target="_blank">© NY Moynihan</a>',
          ].join(' | '),
          compact: false
        }));

        console.log("Map initialized");
      });
    } catch (e) {
      console.log("Error initializing map", e);
    }
  }, []);

  return (
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
          <Link to={"/map"}>View Full Map</Link>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;