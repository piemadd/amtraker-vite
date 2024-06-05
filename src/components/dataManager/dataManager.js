export class DataManager {
  constructor() {
    const now = Date.now();

    this._now = now;
    this._id = (Math.random() + 1).toString(36).substring(7);
    this._data = JSON.parse(localStorage.getItem('amtraker_datamanager_v1_data') ?? '{}');
    this._lastUpdated = localStorage.getItem('amtraker_datamanager_v1_last_updated') ?? 0;

    const updateData = () => {
      if (this._lastUpdated < now - (1000 * 60)) { //if the last time we fetched data was more than a minute ago
        console.log('DM-R:', this._id);
        fetch('https://api-v3.amtraker.com/v3/all', {
          cache: 'reload'
        })
          .then((res) => res.json())
          .then((data) => {
            this._data = data;
          })
          .catch((e) => {
            console.log('Error updating cache: ' + e.toString());
          })
      }

      //i know this is gonna be 1 refresh out of date. fuck you, i don't give a shit
      localStorage.setItem('amtraker_datamanager_v1_data', JSON.stringify(this._data));
      localStorage.setItem('amtraker_datamanager_v1_endpoints', JSON.stringify(this._endpoints));
    }

    setInterval(() => {
      updateData();
    }, 30000) //every 30 seconds, refresh
  }

  //if the data hasnt been updated within 5 minute or is null, update it
  async checkDataStatusAndUpdate() {
    const runFetch = (async () => {
      const res = await fetch('https://api-v3.amtraker.com/v3/all');
      const data = await res.json();
      this._data = data;

      //i know this is gonna be 1 refresh out of date. fuck you, i don't give a shit
      localStorage.setItem('amtraker_datamanager_v1_data', JSON.stringify(this._data));
      localStorage.setItem('amtraker_datamanager_v1_endpoints', JSON.stringify(this._endpoints));
    })

    // if we have no data
    if (Object.keys(this._data).length === 0) {
      console.log('DM-CND:', this._id);
      await runFetch(); //run fetch but dont allow a success until we've updated
    }

    // if data is out of date
    else if (this._lastUpdated < this._now - (1000 * 60)) {
      console.log('DM-COD:', this._id);
      runFetch(); // return data but allow a success for now
    }

    return;
  };

  async getTrains() {
    return this._data.trains;
  }

  async getTrain(trainID) {
    //a full ID is passed
    if (trainID.includes('-')) {
      const trainNum = trainID.split('-')[0];

      if (!this._data.trains[trainNum]) return []; // train number doesn't exist

      const train = this._data.trains[trainNum].find((train) => train.trainID == trainID);

      if (train === undefined) return []; // train number exists, but not this specific id

      return {
        [trainNum]: [train]
      };
    }

    if (!this._data.trains[trainNum]) return []; // train number doesn't exist
    return {
      [trainNum]: this._data.trains[trainNum]
    }
  }

  async getStations() {
    return this._data.stations;
  }

  async getStation(stationCode) {
    if (!this._data.stations[stationCode]) return []; // station doesn't exist

    return {
      [stationCode]: this._data.stations[stationCode]
    };
  }

  async getIDs() {
    return this._data.ids;
  }

  async getShitsFucked() {
    return this._data.shitsFucked;
  }

  async getStaleData() {
    return this._data.staleData;
  }
}

export default DataManager;