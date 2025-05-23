import ManualTrainBox from "./manualTrainBox";
import { useState, useEffect } from "react";

const ShortTrainIDTrainBox = ({ trainID, onClick = null, maxWidth = null, overrideEventCode = false }) => {
  const [train, setTrain] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const dataManager = window.dataManager;

  useEffect(() => {
    dataManager
      .getTrain(trainID)
      .then((data) => {
        setLoading(false);

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

  return <ManualTrainBox train={train} loading={loading} onClick={onClick} maxWidth={maxWidth} overrideEventCode={overrideEventCode}/>;
};

export default ShortTrainIDTrainBox;
