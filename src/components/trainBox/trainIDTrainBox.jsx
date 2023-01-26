import ManualTrainBox from "./manualTrainBox";
import { useState, useEffect } from "react";

const TrainIDTrainBox = ({ trainID }) => {
  const [train, setTrain] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const shortenedTrainID = `${trainID.split("-")[0]}-${trainID.split("-")[2]}`;

  useEffect(() => {
    fetch(`https://api-v3.amtraker.com/v3/trains/${shortenedTrainID}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (Array.isArray(data) && data.length === 0) {
          throw new Error("Train data not valid");
        }

        const trainData = data[shortenedTrainID.split("-")[0]][0];
        const schDep = new Date(trainData.stations[0].dep);

        //removing train if the saved train id doesn't match the data
        if (
          schDep.getMonth() + 1 !== parseInt(trainID.split("-")[1]) ||
          schDep.getFullYear().toString().substring(2, 4) !==
            trainID.split("-")[3]
        ) {
          console.log("data not valid for", trainID, "returning");

          localStorage.setItem(
            "savedTrainsAmtrakerV3",
            localStorage
              .getItem("savedTrainsAmtrakerV3")
              .split(",")
              .filter((n) => {
                console.log(n, trainID);
                return trainID !== n;
              })
              .join(",")
          );

          return;
        }

        setTrain(trainData);
      })
      .catch((err) => {
        console.log(err);

        //removing train if data is invalid

        console.log("data not valid for", trainID, "returning");

        localStorage.setItem(
          "savedTrainsAmtrakerV3",
          localStorage
            .getItem("savedTrainsAmtrakerV3")
            .split(",")
            .filter((n) => {
              console.log(n, trainID);
              return trainID !== n;
            })
            .join(",")
        );

        return;
      });
  }, [trainID, shortenedTrainID]);

  //not sure what this is for tbh, should be covered above
  if (train === undefined) return null;

  return <ManualTrainBox train={train} loading={loading} />;
};

export default TrainIDTrainBox;
