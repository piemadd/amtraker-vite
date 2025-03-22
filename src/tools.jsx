import { stationMeta } from "./data/stations";

const manageSavedTrain = (trainNum, trainDate, state) => {
  let currentSaved = localStorage
    .getItem('savedTrainsAmtrakerV3')
    .split(',')
    .filter((n) => n);

  window.dataManager.getIDs().then((validIDs) => {
    if (state) {
      const longTrainID = validIDs.find((element) =>
        element.split("-")[0] == trainNum &&
        element.split("-")[2] == trainDate
      );

      if (longTrainID) currentSaved.push(longTrainID);
    } else {
      currentSaved = currentSaved.filter((element) => !(
        element.split("-")[0] == trainNum &&
        element.split("-")[2] == trainDate
      ));
    };

    localStorage
      .setItem('savedTrainsAmtrakerV3',
        currentSaved.join(',')
      );
  });
};

const getSavedTrain = (trainNum, trainDate) => {
  let currentSaved = 
    (localStorage.getItem('savedTrainsAmtrakerV3') ?? '')
    .split(',')
    .filter((n) => n);

  return currentSaved.some((element) =>
    element.split("-")[0] == trainNum &&
    element.split("-")[2] == trainDate
  );
};

const hoursAndMinutesUnitl = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.max(then - now, 0);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60 / 60 - hours) * 60);
  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;
  if (hours === 0) amount = `${Math.abs(minutes)}m`;

  return amount;
};

const toHoursAndMinutesLate = (date1, date2) => {
  if (
    date1.toString() === "Invalid Date" ||
    date2.toString() === "Invalid Date"
  )
    return "Unknown (Estimate Error)";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Unknown (Schedule Error)";

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

const calculateDistanceBetweenCoordinates = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

const presetExponential = (x) => {
  const result = Math.min(x * x, 1);
  //console.log(result)
  return result;
};

const calculateTimeTilLocation = (train, station, location) => {
  const distanceBetweenTrainAndStation = calculateDistanceBetweenCoordinates(
    train.lat,
    train.lon,
    stationMeta[station.code].lat,
    stationMeta[station.code].lon
  );

  //takes distance between train and location and adjusts it along
  //a curve to increase the chances to be early rather than late

  const distanceBetweenTrainAndLocation =
    presetExponential(
      calculateDistanceBetweenCoordinates(
        train.lat,
        train.lon,
        location[0],
        location[1]
      ) / distanceBetweenTrainAndStation
    ) * distanceBetweenTrainAndStation;

  const unadjustedDistanceBetweenStationAndLocation =
    calculateDistanceBetweenCoordinates(
      train.lat,
      train.lon,
      location[0],
      location[1]
    );

  //in ms
  const timeUntilTrainAtStation =
    new Date(station.arr).valueOf() - new Date(train.lastValTS).valueOf();

  const averageVelocity =
    distanceBetweenTrainAndStation / timeUntilTrainAtStation;
  const timeUntilTrainAtLocation =
    distanceBetweenTrainAndLocation / averageVelocity;

  //console.log('distanceBetweenTrainAndLocation', distanceBetweenTrainAndLocation)
  //console.log('distanceBetweenTrainAndStation', distanceBetweenTrainAndStation)
  //console.log('timeUntilTrainAtStation', timeUntilTrainAtStation)

  if (distanceBetweenTrainAndLocation > distanceBetweenTrainAndStation) {
    return "Train has already passed or you are along the wrong tracks";
  }

  //if further away than ~50 miles, return an "error"
  if (unadjustedDistanceBetweenStationAndLocation > 80467) {
    return "Too far away to give estimate, try again when within ~50mi.";
  }

  return hoursAndMinutesUnitl(new Date().valueOf() + timeUntilTrainAtLocation);
};

const initAlwaysTracked = () => {
  if (!localStorage.getItem("alwaysTrackedAmtrakerV3"))
    localStorage.setItem("alwaysTrackedAmtrakerV3", "");
};

const autoAddTrains = async (trainArr) => {
  const dataManager = window.dataManager;
  const ids = await dataManager.getIDs();

  const alwaysTracked = (localStorage
    .getItem("alwaysTrackedAmtrakerV3") ?? '')
    .split(",");

  let savedTrains = (localStorage.getItem("savedTrainsAmtrakerV3") ?? '').split(",");

  ids.forEach((id) => {
    const trainNum = id.split("-")[0];

    if (alwaysTracked.includes(trainNum)) {
      if (!savedTrains.includes(id)) {
        savedTrains.push(id);
      }
    }
  });

  localStorage.setItem(
    "savedTrainsAmtrakerV3",
    savedTrains.filter((n) => n.length > 0).join(",")
  );
};

const addAlwaysTracked = (trainNum) => {
  const alwaysTracked = localStorage
    .getItem("alwaysTrackedAmtrakerV3")
    .split(",");
  if (alwaysTracked.includes(trainNum)) return;
  alwaysTracked.push(trainNum);
  localStorage.setItem(
    "alwaysTrackedAmtrakerV3",
    alwaysTracked.filter((n) => n.length > 0).join(",")
  );
};

const removeAlwaysTracked = (trainNum) => {
  const alwaysTracked = localStorage
    .getItem("alwaysTrackedAmtrakerV3")
    .split(",");
  if (!alwaysTracked.includes(trainNum)) return;
  alwaysTracked.splice(alwaysTracked.indexOf(trainNum), 1);
  localStorage.setItem(
    "alwaysTrackedAmtrakerV3",
    alwaysTracked.filter((n) => n.length > 0).join(",")
  );
};

export {
  hoursAndMinutesUnitl,
  toHoursAndMinutesLate,
  calculateDistanceBetweenCoordinates,
  presetExponential,
  calculateTimeTilLocation,
  initAlwaysTracked,
  addAlwaysTracked,
  removeAlwaysTracked,
  autoAddTrains,
  manageSavedTrain,
  getSavedTrain,
};
