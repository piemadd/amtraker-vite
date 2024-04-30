export class DataManager {
  constructor() {
    const now = Date.now();

    this._data = JSON.parse(localStorage.getItem('amtraker_datamanager_v1_data') ?? '{}');
    this._lastUpdated = localStorage.getItem('amtraker_datamanager_v1_last_updated') ?? 0;

    const updateData = () => {
      if (this._lastUpdated < now - (1000 * 60)) { //if the last time we fetched data was more than a minute ago
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
    const now = Date.now();

    if (this._lastUpdated < now - (1000 * 60) || Object.keys(this._data).length === 0) { //if the last time we fetched data was more than a minute ago
      const res = await fetch('https://api-v3.amtraker.com/v3/all', {
        cache: 'reload'
      });
      const data = await res.json();
      this._data = data;

      //i know this is gonna be 1 refresh out of date. fuck you, i don't give a shit
      localStorage.setItem('amtraker_datamanager_v1_data', JSON.stringify(this._data));
      localStorage.setItem('amtraker_datamanager_v1_endpoints', JSON.stringify(this._endpoints));
    }

    return;
  };

  async getTrains() {
    await this.checkDataStatusAndUpdate();
    return this._data.trains;
  }

  async getTrain(trainID) {
    await this.checkDataStatusAndUpdate();

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
    await this.checkDataStatusAndUpdate();
    return this._data.stations;
  }

  async getStation(stationCode) {
    await this.checkDataStatusAndUpdate();
    if (!this._data.stations[stationCode]) return []; // station doesn't exist

    return {
      [stationCode]: this._data.stations[stationCode]
    };
  }

  async getIDs() {
    await this.checkDataStatusAndUpdate();
    return this._data.ids;
  }

  async getShitsFucked() {
    await this.checkDataStatusAndUpdate();
    return this._data.shitsFucked;
  }

  async getStaleData() {
    await this.checkDataStatusAndUpdate();
    return this._data.staleData;
  }
}

export default DataManager;