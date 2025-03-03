import activatePopup from "../paths/map/PopupActivation";
import ManualTrainPopup from "./trainBox/maualTrainPopup";
import ManualStationPopup from "./stationBox/maualStationPopup";
import { Popup } from "maplibre-gl";

const ManualMultiplePopup = ({ finalItems, mapRef, setPopupInfo, sourcePopup }) => {
  const hasTrains = finalItems.find((item) => item.layer.id == 'trains');
  const hasStations = finalItems.find((item) => item.layer.id == 'stations');

  let titleText = 'Feature';
  if (hasTrains && !hasStations) titleText = 'Train';
  if (!hasTrains && hasStations) titleText = 'Station';

  return (
    <div className='train-popup'>
      <div className='train-popup__header'>
        Select a {titleText}:
      </div>
      <div className='train-popup__info train-popup__updated greyed'></div>
      {
        finalItems.map((item) => {
          switch (item.layer.id) {
            case 'trains':
              return (
                <div
                  key={item.properties.trainID}
                  className="train-box"
                  style={{
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    const train = {
                      ...item.properties,
                      stations: JSON.parse(item.properties.stations)
                    };

                    setPopupInfo(train);
                    sourcePopup.remove();
                    activatePopup(
                      mapRef,
                      <ManualTrainPopup train={train} />,
                      new Popup({
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
                    }}>{item.properties.trainID.split('-')[0]} ({item.properties.trainID.split('-')[1]})</span> {item.properties.routeName}
                  </div>
                </div>
              )
            case 'stations':
              return (
                <div
                  key={item.properties.code}
                  className="train-box"
                  style={{
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    const station = {
                      ...item.properties,
                      trains: JSON.parse(item.properties.trains)
                    }
                    setPopupInfo(station);
                    sourcePopup.remove();
                    activatePopup(
                      mapRef,
                      <ManualStationPopup station={station} />,
                      new Popup({
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
  );
};

export default ManualMultiplePopup;
