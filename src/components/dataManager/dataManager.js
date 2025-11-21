import sampleTrain from './sampleTrain.json';
import localForage from "localforage";

localForage.config({
  name: "AmtrakerOffline",
  storeName: "AmtrakerOfflineStore",
  version: "3"
})

const URL_TO_USE = 'https://api.amtraker.com/v3/all';
//const URL_TO_USE = 'http://localhost:3001/v3/all';

export class DataManager {
  constructor() {

    this._id = (Math.random() + 1).toString(36).substring(7);
    this._data = {
      trains: {},
      stations: {},
      ids: [],
      shitsFucked: true,
      staleData: {
        avgLastUpdate: 9999999,
        activeTrains: 1,
        stale: true,
      }
    };
    this._lastUpdated = 0;

    const updateData = () => {
      const now = Date.now();
      console.log('DM-T:', this._lastUpdated, now, now - (1000 * 60))
      if (this._lastUpdated < now - (1000 * 60)) { //if the last time we fetched data was more than a minute ago
        console.log('DM-R:', this._id);
        fetch(URL_TO_USE, {
          cache: 'reload'
        })
          .then((res) => res.json())
          .then((data) => {
            this._data = data;
            this._lastUpdated = Date.now();
            localForage.setItem('amtraker_datamanager_v1_data', JSON.stringify(data));
            console.log('DM-R:', this._id, 'Success');
          })
          .catch((e) => {
            console.log('Error updating cache: ' + e.toString());
          })
      } else {
        console.log('DM-R', this._id, ' Not Yet')
      }

      //i know this is gonna be 1 refresh out of date. fuck you, i don't give a shit
      localForage.setItem('amtraker_datamanager_v1_data', JSON.stringify(this._data));
    };

    setInterval(() => {
      updateData();
    }, 15000) //every 15 seconds, refresh
  }

  //if the data hasnt been updated within 5 minute or is null, update it
  async checkDataStatusAndUpdate() {
    const runFetch = (async () => {
      try {
        if (!this._lastUpdated || !this._data || this._lastUpdated < Date.now() - (1000 * 60 * 5)) {
          const res = await fetch(URL_TO_USE, {
            cache: 'reload',
            signal: AbortSignal.timeout(5000)
          });
          const data = await res.json();
          this._data = data;
          this._lastUpdated = Date.now();

          localForage.setItem('amtraker_datamanager_v1_data', JSON.stringify(this._data));
          console.log('Initial request succeeded')
        }
      } catch (e) {
        let tempData = await localForage.getItem('amtraker_datamanager_v1_data');

        if (!tempData) tempData = '{"trains":{},"stations":{},"ids":[],"shitsFucked":true,"staleData":{"avgLastUpdate":9999999,"activeTrains":1,"stale":true}}';

        this._data = JSON.parse(tempData);
        this._lastUpdated = await localForage.getItem('amtraker_datamanager_v1_last_updated');
        console.log('Initial request timed out, using cached data')
      }
    })

    // if we have no data
    if (Object.keys(this._data).length === 0) {
      console.log('DM-CND:', this._id);
      await runFetch(); //run fetch but dont allow a success until we've updated
    }

    // if data is out of date
    else if (this._lastUpdated < Date.now() - (1000 * 60)) {
      console.log('DM-COD:', this._id);
      await runFetch(); // return data but allow a success for now
      //actually we want to try blocking, at least for now
    }

    return;
  };

  async getTrains() {
    console.log('DM: All Trains')
    return this._data.trains;
  }

  getTrainSync(trainID, justObject = false) {
    console.log('DM: Specific Train')
    //a full ID is passed
    if (trainID == '9999') return sampleTrain;

    if (trainID.includes('-')) {
      if (trainID == '9999-21') return { "9999": [sampleTrain['9999'][0]] };
      if (trainID == '9999-22') return { "9999": [sampleTrain['9999'][1]] };
      if (trainID == '9999-21' && justObject) return sampleTrain['9999'][0];
      if (trainID == '9999-22' && justObject) return sampleTrain['9999'][1];

      const trainNum = trainID.split('-')[0];

      if (!this._data.trains[trainNum]) return []; // train number doesn't exist

      const train = this._data.trains[trainNum].find((train) => train.trainID == trainID);

      if (train === undefined) return []; // train number exists, but not this specific id

      if (justObject) return train;
      return { [trainNum]: [train] };
    }

    if (!this._data.trains[trainID]) return []; // train number doesn't exist
    return {
      [trainID]: this._data.trains[trainID]
    }
  }

  async getTrain(trainID, justObject = false) {
    return this.getTrainSync(trainID, justObject);
  }

  getTrainExists(trainID) {
    const train = this.getTrainSync(trainID);

    if (Array.isArray(train)) return false;
    return true;
  }

  getTrainExistsLongID(longTrainID) {
    const splitLongTrainID = longTrainID.split('-');
    const trainID = `${splitLongTrainID[0]}-${splitLongTrainID[2]}`;

    return this.getTrainExists(trainID);
  }

  async getStations() {
    console.log('DM: All Stops')
    return this._data.stations;
  }

  async getStation(stationCode) {
    console.log('DM: Specific Stop')

    if (!this._data.stations[stationCode]) return []; // station doesn't exist

    return {
      [stationCode]: this._data.stations[stationCode]
    };
  }

  async getIDs() {
    console.log('DM: IDs')

    console.log(this._data)

    return this._data.ids;
  }

  async getShitsFucked() {
    console.log('DM: ShitsFucked')
    return this._data.shitsFucked;
  }

  async getStaleData() {
    console.log('DM: Stale Data')
    return this._data.staleData;
  }
}

export default DataManager;