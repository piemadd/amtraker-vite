import ManualTrainBox from "./manualTrainBox";
import { useState, useEffect } from "react";
import DataManager from "../dataManager/dataManager";

const TrainIDTrainBox = ({ trainID, overrideEventCode = false }) => {
  const [train, setTrain] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const dataManager = window.dataManager;

  const shortenedTrainID = `${trainID.split("-")[0]}-${trainID.split("-")[2]}`;
  useEffect(() => {
    dataManager
      .getTrain(shortenedTrainID)
      .then((data) => {
        if (Array.isArray(data) && data.length === 0) {
          console.log("removing train due to invalid data");
          const newSavedTrains = localStorage
            .getItem("savedTrainsAmtrakerV3")
            .split(",")
            .filter((n) => n)
            .filter((train) => train !== trainID);

          localStorage.setItem(
            "savedTrainsAmtrakerV3",
            newSavedTrains.join(",")
          );

          return null;
          //throw new Error("Train data not valid");
        }

        const trainData = data[shortenedTrainID.split("-")[0]][0];
        const schDep = new Date(trainData.stations[0].dep);

        //removing train if the saved train id doesn't match the data
        if (
          (schDep.getMonth() + 1 !== parseInt(trainID.split("-")[1]) ||
            schDep.getFullYear().toString().substring(2, 4) !==
              trainID.split("-")[3]) &&
          !trainID.includes("NaN")
        ) {
          console.log("removing train due to incorrect date");

          const newSavedTrains = localStorage
            .getItem("savedTrainsAmtrakerV3")
            .split(",")
            .filter((n) => n)
            .filter((train) => train !== trainID);

          localStorage.setItem(
            "savedTrainsAmtrakerV3",
            newSavedTrains.join(",")
          );
          return null;
        }

        setLoading(false);
        setTrain(trainData);
      })
      .catch((err) => {
        console.log(err);

        //removing train if data is invalid

        console.log("data not valid for", trainID, "returning");

        /*

        const newSavedTrains = localStorage
    .getItem("savedTrainsAmtrakerV3")
    .split(",")
    .filter((n) => n)
    .filter((train) => train !== trainID);

  localStorage.setItem("savedTrainsAmtrakerV3", newSavedTrains.join(","));
        */

        return null;
      });
  }, [trainID, shortenedTrainID]);

  //not sure what this is for tbh, should be covered above
  if (train === undefined) return null;

  return <ManualTrainBox train={train} loading={loading} overrideEventCode={overrideEventCode} />;
};

export default TrainIDTrainBox;
