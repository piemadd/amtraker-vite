import MiniMap from "./miniMap";

const MiniMapHolderTest = () => {
  const currentLocation = new URL(document.location);
  const queryDict = Object.fromEntries(currentLocation.searchParams);

  const trainsArr = queryDict.trains?.split(',') ?? [];
  const stationsArr = queryDict.stations?.split(',') ?? [];

  return (
    <div style={{
      height: '100dvh',
      width: '100vw'
    }}>
      <MiniMap filteredTrainIDs={trainsArr} filteredStationCodes={stationsArr} />
    </div>
  );
};

export default MiniMapHolderTest;