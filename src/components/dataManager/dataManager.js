import sampleTrain from "./sampleTrain.json";
import localForage from "localforage";

localForage.config({ name: "AmtrakerOffline", storeName: "AmtrakerOfflineStore", version: "3" });

const URL_TO_USE = "https://api.amtraker.com/v3/all";
//const URL_TO_USE = 'http://localhost:3001/v3/all';

export class DataManager {
  constructor() {
    this._id = (Math.random() + 1).toString(36).substring(7);
    this._data = {
      trains: {},
      stations: {},
      ids: [],
      shitsFucked: true,
      staleData: { avgLastUpdate: 9999999, activeTrains: 1, stale: true }
    };
    this._lastUpdated = 0;

    const updateData = () => {
      const now = Date.now();
      console.log("DM-T:", this._lastUpdated, now, now - 1000 * 60);
      if (this._lastUpdated < now - 1000 * 60) {
        //if the last time we fetched data was more than a minute ago
        console.log("DM-R:", this._id);
        fetch(URL_TO_USE, {
          cache: "reload",
          headers: { "User-Agent": "AmtrakerVite/v3.22.1 (+https://amtraker.com)", "Amtraker-Version": "v3.22.1" }
        })
          .then((res) => res.json())
          .then((data) => {
            this._data = data;
            this._lastUpdated = Date.now();
            localForage.setItem("amtraker_datamanager_v1_data", JSON.stringify(data));
            console.log("DM-R:", this._id, "Success");
          })
          .catch((e) => {
            console.log("Error updating cache: " + e.toString());
          });
      } else {
        console.log("DM-R", this._id, " Not Yet");
      }

      //i know this is gonna be 1 refresh out of date. fuck you, i don't give a shit
      localForage.setItem("amtraker_datamanager_v1_data", JSON.stringify(this._data));
    };

    setInterval(() => {
      updateData();
    }, 15000); //every 15 seconds, refresh

    // the in flight fetch from checkDataStatusAndUpdate, so overlapping calls share one request
    this._fetchPromise = null;

    // start loading right away so the app can render while data comes in. async getters wait on this,
    // sync getters return whatever is loaded so far (empty until this resolves). never rejects
    this._initialLoad = this.checkDataStatusAndUpdate().catch((e) => {
      console.log("Initial load failed: " + e.toString());
    });
  }

  // resolves once the first load (fresh data or the offline cache) is done
  ready() {
    return this._initialLoad;
  }

  //if the data hasnt been updated within 5 minutes or is null, update it
  async checkDataStatusAndUpdate() {
    const runFetch = async () => {
      try {
        const res = await fetch(URL_TO_USE, {
          cache: "reload",
          headers: { "User-Agent": "AmtrakerVite/v3.22.1 (+https://amtraker.com)", "Amtraker-Version": "v3.22.1" },
          signal: AbortSignal.timeout(5000)
        });
        const data = await res.json();
        this._data = data;
        this._lastUpdated = Date.now();

        localForage.setItem("amtraker_datamanager_v1_data", JSON.stringify(this._data));
        localForage.setItem("amtraker_datamanager_v1_last_updated", this._lastUpdated);
        console.log("Initial request succeeded");
      } catch (e) {
        // already have data in memory, keep it rather than swapping in the (older or equal) cache
        if (this._lastUpdated) {
          console.log("Request failed, keeping current data");
          return;
        }

        let tempData = await localForage.getItem("amtraker_datamanager_v1_data");

        if (!tempData)
          tempData =
            '{"trains":{},"stations":{},"ids":[],"shitsFucked":true,"staleData":{"avgLastUpdate":9999999,"activeTrains":1,"stale":true}}';

        this._data = JSON.parse(tempData);
        this._lastUpdated = (await localForage.getItem("amtraker_datamanager_v1_last_updated")) ?? 0;
        console.log("Initial request timed out, using cached data");
      }
    };

    if (this._lastUpdated && this._data && this._lastUpdated >= Date.now() - 1000 * 60 * 5) return;

    if (!this._fetchPromise) {
      console.log("DM-COD:", this._id);
      this._fetchPromise = runFetch().finally(() => {
        this._fetchPromise = null;
      });
    }

    return this._fetchPromise;
  }

  async getTrains() {
    await this._initialLoad;
    console.log("DM: All Trains");
    return this._data.trains;
  }

  getTrainSync(trainID, justObject = false) {
    console.log("DM: Specific Train");
    //a full ID is passed
    if (trainID == "9999") return sampleTrain;

    if (trainID.includes("-")) {
      if (trainID == "9999-21") return { 9999: [sampleTrain["9999"][0]] };
      if (trainID == "9999-22") return { 9999: [sampleTrain["9999"][1]] };
      if (trainID == "9999-21" && justObject) return sampleTrain["9999"][0];
      if (trainID == "9999-22" && justObject) return sampleTrain["9999"][1];

      const trainNum = trainID.split("-")[0];

      if (!this._data.trains[trainNum]) return []; // train number doesn't exist

      const train = this._data.trains[trainNum].find((train) => train.trainID == trainID);

      if (train === undefined) return []; // train number exists, but not this specific id

      if (justObject) return train;
      return { [trainNum]: [train] };
    }

    if (!this._data.trains[trainID]) return []; // train number doesn't exist
    return { [trainID]: this._data.trains[trainID] };
  }

  async getTrain(trainID, justObject = false) {
    await this._initialLoad;
    return this.getTrainSync(trainID, justObject);
  }

  getTrainExists(trainID) {
    const train = this.getTrainSync(trainID);

    if (Array.isArray(train)) return false;
    return true;
  }

  getTrainExistsLongID(longTrainID) {
    const splitLongTrainID = longTrainID.split("-");
    const trainID = `${splitLongTrainID[0]}-${splitLongTrainID[2]}`;

    return this.getTrainExists(trainID);
  }

  async getStations() {
    await this._initialLoad;
    console.log("DM: All Stops");
    return this._data.stations;
  }

  getStationSync(stationCode) {
    console.log("DM: Specific Stop");

    if (!this._data.stations[stationCode]) return []; // station doesn't exist

    return { [stationCode]: this._data.stations[stationCode] };
  }

  async getStation(stationCode) {
    await this._initialLoad;
    return this.getStationSync(stationCode);
  }

  async getIDs() {
    await this._initialLoad;
    console.log("DM: IDs");

    return this._data.ids;
  }

  getIDsSync() {
    console.log("DM: IDs");

    return this._data.ids;
  }

  async getShitsFucked() {
    await this._initialLoad;
    console.log("DM: ShitsFucked");
    return this._data.shitsFucked;
  }

  async getStaleData() {
    await this._initialLoad;
    console.log("DM: Stale Data");
    return this._data.staleData;
  }
}

export default DataManager;
