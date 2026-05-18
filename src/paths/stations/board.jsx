import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import totallyAFont from "../../components/board-accessories/totally-a-font";

import "../trains/trains.css"; //fuck it we ball
import replaceTrainStrings from "../../components/board-accessories/string-replacements";

const StationBoardPage = () => {
  const { stationCode } = useParams();
  const navigate = useNavigate();

  const dataManager = window.dataManager;
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stationData, setStationData] = useState([]);
  const [onlyShowUpcoming, setOnlyShowUpcoming] = useState(false);
  const [filteredTrainIDs, setFilteredTrainIDs] = useState([]);
  const [filteredStationCodes, setFilteredStationCodes] = useState([]);
  const [isInvalid, setIsInvalid] = useState(false);
  const [trainSections, setTrainSections] = useState([]);
  const canvasRenderSize = [window.innerWidth, window.innerHeight];
  const canvasActualSize = [window.innerWidth, window.innerHeight];
  const maxXPixel = Math.floor(window.innerWidth / 8);
  const maxYPixel = Math.floor(window.innerHeight / 8);
  const [maxTimeWidth, setMaxTimeWidth] = useState(1);
  const [maxNumWidth, setMaxNumWidth] = useState(1);

  document.title = `${stationData && !loading ? stationData.name : stationCode} Station Arrivals Board - Amtraker`;

  const canvasRef = useRef(null);

  const initializeFakePixel = () => {
    const offScreenPixelCanvas = new OffscreenCanvas(8, 8);
    const ctx = offScreenPixelCanvas.getContext("2d");

    ctx.shadowColor = "#c24a00"; // Shadow color with transparency
    ctx.shadowBlur = 4; // Blur radius
    ctx.shadowOffsetX = 0; // Horizontal distance
    ctx.shadowOffsetY = 0; // Vertical distance

    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2); // Center (100,100), radius 50
    ctx.fillStyle = "#f45e00"; // Circle color
    ctx.fill();

    return offScreenPixelCanvas.transferToImageBitmap();
  };

  const drawPixel = (imgData, x, y, r, g, b, a) => {
    const offset = (y * imgData.width + x) * 4;
    imgData.data[offset] = r; // Red
    imgData.data[offset + 1] = g; // Green
    imgData.data[offset + 2] = b; // Blue
    imgData.data[offset + 3] = a; // Alpha
  };

  const drawFakePixel = (ctx, fakePixel, x, y) => {
    ctx.drawImage(fakePixel, x, y);
  };

  const drawLetter = (ctx, fakePixel, fontLetter, x, y) => {
    const letterWidth = fontLetter[0].length;
    const letterHeight = fontLetter.length;

    for (let r = 0; r < fontLetter.length; r++) {
      for (let c = 0; c < fontLetter[r].length; c++) {
        /*
        drawPixel(
          imgData,
          x + c,
          y + r,
          fontLetter[r][c],
          fontLetter[r][c],
          fontLetter[r][c],
          255,
        );
        */
        if (fontLetter[r][c] != 0)
          drawFakePixel(ctx, fakePixel, (x + c) * 8, (y + r) * 8);
      }
    }
  };

  const drawString = (ctx, fakePixel, letters, font, x, y) => {
    let currentOffset = 0;

    const fontLetters = letters
      .split("")
      .map((letter) => font[letter] ?? font["0"]);

    for (let i = 0; i < fontLetters.length; i++) {
      drawLetter(ctx, fakePixel, fontLetters[i], x + currentOffset, y);
      currentOffset += fontLetters[i][0].length + 1;
    }
  };

  const drawMovingString = (ctx, fakePixel, string, font, x, y, offset) => {
    drawString(ctx, fakePixel, string, font, x - offset, y);
  };

  const drawHorizontalLine = (ctx, fakePixel, x, y, length) => {
    for (let i = 0; i < length; i++) {
      drawFakePixel(ctx, fakePixel, (x + i) * 8, y * 8);
    }
  };

  const drawVerticalLine = (ctx, fakePixel, x, y, length) => {
    for (let i = 0; i < length; i++) {
      drawFakePixel(ctx, fakePixel, x * 8, (y + i) * 8);
    }
  };

  const drawSections = (ctx, fakePixel, sections, font, offset) => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      switch (section.type) {
        case "string":
          drawMovingString(
            ctx,
            fakePixel,
            section.string,
            font,
            section.x,
            section.y,
            section.moving ? offset : 0,
          );
          break;
        case "horizontalLine":
          drawHorizontalLine(
            ctx,
            fakePixel,
            section.x,
            section.y,
            section.length,
          );
          break;
        case "verticalLine":
          drawVerticalLine(
            ctx,
            fakePixel,
            section.x,
            section.y,
            section.length,
          );
          break;
        default:
          // do nothing
          break;
      }
    }
  };

  const queryWidthOfString = (letters, font) => {
    const length = letters
      .split("")
      .map((letter) => font[letter] ?? font["0"])
      .map((letter) => letter[0].length + 1)
      .reduce((acc, ll) => acc + ll, 0);

    return length - 1;
  };

  const convertTrainToSections = (train, rowNum, numberWidth, timeWidth) => {
    return [
      {
        type: "horizontalLine",
        x: 0,
        y: 9 + (rowNum + 2) * 10,
        length: Math.floor(canvasRenderSize[0] / 8),
      },
      {
        type: "string",
        x: 1,
        y: 1 + (rowNum + 2) * 10,
        string: train.timeString,
        moving: false,
      },
      {
        type: "verticalLine",
        x: timeWidth + 2,
        y: (rowNum + 2) * 10,
        length: 9,
      },
      {
        type: "string",
        x: timeWidth + 4,
        y: 1 + (rowNum + 2) * 10,
        string: train.trainNumRaw,
        moving: false,
      },
      {
        type: "verticalLine",
        x: numberWidth + timeWidth + 5,
        y: (rowNum + 2) * 10,
        length: 9,
      },
      {
        type: "string",
        x: numberWidth + timeWidth + 7,
        y: 1 + (rowNum + 2) * 10,
        string: train.routeName,
        moving: false,
      },
    ];
  };

  const processTrains = (trainIDs) => {
    let widestTrainNumber = 0;
    let widestTrainTime = 0;

    const now = Date.now();
    const trainData = trainIDs
      .map((trainID) => Object.values(dataManager.getTrainSync(trainID))[0][0])
      .map((train) => {
        const trainAtThisStation = train.stations.find(
          (station) => station.code == stationCode,
        );
        const arr = trainAtThisStation.arr ?? trainAtThisStation.dep;
        const dep = trainAtThisStation.dep ?? trainAtThisStation.arr;

        const timeToUse = new Date(train.status == "Enroute" ? arr : dep);

        console.log(train.routeName)
        train.routeName = replaceTrainStrings(train.routeName);
        console.log(train.routeName)

        return {
          ...train,
          thisStation: trainAtThisStation,
          timeToUse: timeToUse.valueOf(),
          timeString: timeToUse
            .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            .split(" ")[0],
        };
      })
      .sort((a, b) => a.timeToUse - b.timeToUse)
      .filter((train) => now < train.timeToUse + 1000 * 60)
      .slice(0, Math.ceil(maxYPixel / 10) - 2);

    trainData.forEach((train) => {
      const numWidth = queryWidthOfString(
        train.trainNumRaw.toString(),
        totallyAFont,
      );
      if (numWidth > widestTrainNumber) widestTrainNumber = numWidth;

      const timeWidth = queryWidthOfString(train.timeString, totallyAFont);
      if (timeWidth > widestTrainTime) widestTrainTime = timeWidth;
    });

    console.log(widestTrainNumber, widestTrainTime)
    setMaxNumWidth(widestTrainNumber);
    setMaxTimeWidth(widestTrainTime);

    const convertedTrains = trainData.flatMap((train, i) =>
      convertTrainToSections(train, i, widestTrainNumber, widestTrainTime),
    );

    setTrainSections(convertedTrains);
    return convertedTrains;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const canvasSetupAndEventLoop = async () => {
    // setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    const fakePixel = initializeFakePixel();

    const nowString = new Date().toLocaleTimeString();
    const nowStringLength = queryWidthOfString(nowString, totallyAFont);

    // sections
    const sections = [
      {
        type: "string",
        x: 1,
        y: 1,
        string: stationData.name ?? 'Loading',
        moving: false,
      },
      {
        type: "string",
        x: maxXPixel - nowStringLength - 1,
        y: 1,
        string: nowString,
        moving: false,
      },
      {
        type: "horizontalLine",
        x: 0,
        y: 9,
        length: Math.floor(canvasRenderSize[0] / 8),
      },
      {
        type: "string",
        x: 1,
        y: 11,
        string: stationData.name ?? 'Loading',
        moving: false,
      },
      {
        type: "horizontalLine",
        x: 0,
        y: 19,
        length: Math.floor(canvasRenderSize[0] / 8),
      },
    ];

    const initialTrainSections = processTrains(
      dataManager.getStationSync(stationCode)[stationCode].trains,
    );

    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.rect(0, 0, canvasRenderSize[0], canvasRenderSize[1]);
    ctx.fill();
    drawSections(ctx, fakePixel, sections, totallyAFont, 0);
    drawSections(ctx, fakePixel, initialTrainSections, totallyAFont, 0);

    // fetching
    setInterval(() => {
      processTrains(
        dataManager.getStationSync(stationCode)[stationCode].trains,
      );
    }, 1000 * 10);

    // actually drawing
    setInterval(() => {
      const nowString = new Date().toLocaleTimeString();
      const nowStringLength = queryWidthOfString(nowString, totallyAFont);

      console.log(maxTimeWidth)

      const sections = [
      {
        type: "string",
        x: 1,
        y: 1,
        string: stationData.name ?? 'Loading',
        moving: false,
      },
      {
        type: "string",
        x: maxXPixel - nowStringLength - 1,
        y: 1,
        string: nowString,
        moving: false,
      },
      {
        type: "horizontalLine",
        x: 0,
        y: 9,
        length: Math.floor(canvasRenderSize[0] / 8),
      },
      {
        type: "string",
        x: 1,
        y: 11,
        string: 'Time',
        moving: false,
      },
      {
        type: "string",
        x: maxTimeWidth,
        y: 11,
        string: 'Num',
        moving: false,
      },
      {
        type: "horizontalLine",
        x: 0,
        y: 19,
        length: Math.floor(canvasRenderSize[0] / 8),
      },
    ];

      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.rect(0, 0, canvasRenderSize[0], canvasRenderSize[1]);
      ctx.fill();
      drawSections(ctx, fakePixel, sections, totallyAFont, 0);
      drawSections(
        ctx,
        fakePixel,
        trainSections.length > 0 ? trainSections : initialTrainSections,
        totallyAFont,
        0,
      );
    }, 1000 * 1);

    // event loop
    /*
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.rect(0, 0, canvasRenderSize[0], canvasRenderSize[1]);
      ctx.fill();
      drawString(
        ctx,
        fakePixel,
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        totallyAFont,
        0 - i,
        0,
      );
      drawString(
        ctx,
        fakePixel,
        "abcdefghijklmnopqrstuvwxyz",
        totallyAFont,
        0 - i,
        8,
      );
      drawString(ctx, fakePixel, "0123456789", totallyAFont, 0 - i, 18);
      await sleep(1000 / 30);
    }
    */
  };

  useEffect(() => {
    dataManager.getStation(stationCode).then((data) => {
      if (!data[stationCode])
        navigate(`/stations/${stationCode}`, {
          replace: true,
        });
      setFilteredTrainIDs(data[stationCode].trains);
      setFilteredStationCodes([stationCode]);
      setStationData(data[stationCode]);
      setLoading(false);
    });
  }, [stationCode]);

  useEffect(() => {
    canvasSetupAndEventLoop();
  }, []);

  return (
    <div
      className="trainPage"
      style={{
        overflow: "hidden",
        background: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasRenderSize[0]}
        height={canvasRenderSize[1]}
        style={{
          width: canvasActualSize[0],
          height: canvasActualSize[1],
          imageRendering: "pixelated",
          fontSmooth: "never",
          WebkitFontSmoothing: "never",
        }}
      />
    </div>
  );
};

export default StationBoardPage;
