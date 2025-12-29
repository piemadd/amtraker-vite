import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./paths/index/App.css";
import "./paths/trains/trains.css";
import ErrorPage from "./error.jsx";
import LoadingPage from "./loading";
import DataManager from "./components/dataManager/dataManager.js";
import { initAlwaysTracked } from "./tools.jsx";
//import * as serviceWorkerRegistration from "./serviceWorkerRegistration.js";

console.log(`DM-N: ${JSON.stringify(window.dataManager)}`)
const dataManager = new DataManager();
window.dataManager = dataManager;

initAlwaysTracked();

//paths
import App from "./paths/index/App.jsx";

const TrainsByNumber = React.lazy(() => import("./paths/trains/num.jsx"));
const BetterTrainPage = React.lazy(() => import("./paths/trains/train.jsx"));
const TrainsList = React.lazy(() => import("./paths/trains/list.jsx"));
const TrainsLeaderboard = React.lazy(() => import("./paths/trains/leaderboard.jsx"));
const FullTrainsList = React.lazy(() => import("./paths/trains/listFull.jsx"));
const StationsList = React.lazy(() => import("./paths/stations/list.jsx"));
const StationPage = React.lazy(() => import("./paths/stations/station.jsx"));
const Settings = React.lazy(() => import("./paths/index/settings.jsx"));
const Map = React.lazy(() => import("./paths/map/Map.jsx"));
const MiniMapHolderTest = React.lazy(() => import("./components/mapping/miniMapHolderTest.jsx"));
const PrivacyPolicy = React.lazy(() => import("./paths/index/privacy"));
const AboutPage = React.lazy(() => import("./paths/index/about"));
const VotePage = React.lazy(() => import("./paths/index/vote.jsx"));
const ICookaDaMeatBall = React.lazy(() => import("./paths/index/meatball"));
const AtlasIndex = React.lazy(() => import("./paths/atlas/index.jsx"));
const AtlasAdd = React.lazy(() => import("./paths/atlas/add.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/map",
    element: <Map />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/map/miniholdertest",
    element: <MiniMapHolderTest />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/trains",
    element: <TrainsList />,
    errorElement: <ErrorPage />,
  },
  {
    path: "trains/full",
    element: <FullTrainsList />,
    errorElement: <ErrorPage />,
  },
  {
    path: "trains/leaderboard",
    element: <TrainsLeaderboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/trains/:trainNum",
    element: <TrainsByNumber />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/trains/:trainNum/:trainDate",
    element: <BetterTrainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/stations",
    element: <StationsList />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/stations/:stationCode",
    element: <StationPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/atlas",
    element: <AtlasIndex />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/atlas/add",
    element: <AtlasAdd />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vote",
    element: <VotePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bippityboppityicookadameatball",
    element: <ICookaDaMeatBall />,
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

dataManager.checkDataStatusAndUpdate().then(() => {
  root.render(
    <React.Suspense fallback={<LoadingPage />}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </React.Suspense>
  );
});
