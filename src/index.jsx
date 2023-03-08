import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./paths/index/App.css";
import "./paths/trains/trains.css";
import ErrorPage from "./error.jsx";
import LoadingPage from "./loading";
//import * as serviceWorkerRegistration from "./serviceWorkerRegistration.js";

//paths
//import App from "./paths/index/App.jsx";
//import TrainsByNumber from "./paths/trains/num.jsx";
//import BetterTrainPage from "./paths/trains/train.jsx";
//import TrainsList from "./paths/trains/list.jsx";
//import FullTrainsList from "./paths/trains/listFull.jsx";
//import StationsList from "./paths/stations/list.jsx";
//import StationPage from "./paths/stations/station.jsx";
//import Settings from "./paths/index/settings.jsx";
//import Map from "./paths/map/Map.jsx";
//import PrivacyPolicy from "./paths/index/privacy";
//import AboutPage from "./paths/index/about";

const App = React.lazy(() => import("./paths/index/App.jsx"));
const TrainsByNumber = React.lazy(() => import("./paths/trains/num.jsx"));
const BetterTrainPage = React.lazy(() => import("./paths/trains/train.jsx"));
const TrainsList = React.lazy(() => import("./paths/trains/list.jsx"));
const FullTrainsList = React.lazy(() => import("./paths/trains/listFull.jsx"));
const StationsList = React.lazy(() => import("./paths/stations/list.jsx"));
const StationPage = React.lazy(() => import("./paths/stations/station.jsx"));
const Settings = React.lazy(() => import("./paths/index/settings.jsx"));
const Map = React.lazy(() => import("./paths/map/Map.jsx"));
const PrivacyPolicy = React.lazy(() => import("./paths/index/privacy"));
const AboutPage = React.lazy(() => import("./paths/index/about"));

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
    path: "/about",
    element: <AboutPage />,
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
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.Suspense fallback={<LoadingPage />}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </React.Suspense>
);

console.log("NODE_ENV", process.env.NODE_ENV);
/*
if (process.env.NODE_ENV === "production") {
  console.log('production, registring service worker')
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
*/
