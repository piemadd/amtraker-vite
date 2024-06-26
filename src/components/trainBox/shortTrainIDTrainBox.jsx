import ManualTrainBox from "./manualTrainBox";
import { useState, useEffect } from "react";
import DataManager from "../dataManager/dataManager";

const ShortTrainIDTrainBox = ({ trainID }) => {
  const [train, setTrain] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const dataManager = window.dataManager;

  useEffect(() => {
    dataManager
      .getTrains()
      .then((data) => {
        setLoading(false);
        console.log("data fetched", data);

        if (Array.isArray(data) && data.length === 0) {
          throw new Error("Train data not valid");
        }

        const trainData = data[trainID.split("-")[0]][0];
        setTrain(trainData);
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  }, [trainID]);

  //not sure what this is for tbh, should be covered above
  if (train === undefined) return null;

  return <ManualTrainBox train={train} loading={loading} />;
};

export default ShortTrainIDTrainBox;
