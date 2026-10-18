import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import "./paths/index/App.css";
import "./paths/trains/trains.css";
import ErrorPage from "./error.jsx";
import LoadingPage from "./loading";
import DataManager from "./components/dataManager/dataManager.js";
import { initAlwaysTracked } from "./tools.jsx";
import { getLocale, baseLocale } from "./paraglide/runtime.js";
//import * as serviceWorkerRegistration from "./serviceWorkerRegistration.js";

// locale is determined by the url prefix (ie /fr/trains/5), english has no prefix
const currentLocale = getLocale();
const routerBasename = currentLocale === baseLocale ? "/" : `/${currentLocale}`;
document.documentElement.lang = currentLocale;

console.log(`DM-N: ${JSON.stringify(window.dataManager)}`);
const dataManager = new DataManager();
window.dataManager = dataManager;

// referrer
if (document.referrer.includes("android-app://com.amtrak.piero")) {
  window.isAndroidTwaSession = false;
  sessionStorage.setItem("has_android_twa_referrer", "true");
} else {
  window.isAndroidTwaSession = sessionStorage.getItem("has_android_twa_referrer") === "true";
}

initAlwaysTracked();

//paths
import App from "./paths/index/App.jsx";

const BetterTrainsByNumber = React.lazy(() => import("./paths/trains/numBetter.jsx"));
const BetterTrainPage = React.lazy(() => import("./paths/trains/train.jsx"));
const TrainsList = React.lazy(() => import("./paths/trains/list.jsx"));
const TrainsLeaderboard = React.lazy(() => import("./paths/trains/leaderboard.jsx"));
const FullTrainsList = React.lazy(() => import("./paths/trains/listFull.jsx"));
const StationsList = React.lazy(() => import("./paths/stations/list.jsx"));
const StationPage = React.lazy(() => import("./paths/stations/station.jsx"));
//const StationBoardPage = React.lazy(() => import("./paths/stations/board.jsx"));
const Map = React.lazy(() => import("./paths/map/Map.jsx"));
const MiniMapHolderTest = React.lazy(() => import("./components/mapping/miniMapHolderTest.jsx"));
const AboutPage = React.lazy(() => import("./paths/index/about.jsx"));
const ICookaDaMeatBall = React.lazy(() => import("./paths/index/meatball"));
const AtlasIndex = React.lazy(() => import("./paths/atlas/index.jsx"));
const AtlasAdd = React.lazy(() => import("./paths/atlas/add.jsx"));
const AtlasStatsAll = React.lazy(() => import("./paths/atlas/stats_all.jsx"));
const AtlasStatsInd = React.lazy(() => import("./paths/atlas/stats_ind.jsx"));
const AtlasDeleteAccount = React.lazy(() => import("./paths/atlas/delete_account.jsx"));

const router = createBrowserRouter([
  { path: "/", element: <App />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  { path: "/map", element: <Map />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/map/miniholdertest",
    element: <MiniMapHolderTest />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/trains", element: <TrainsList />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "trains/full",
    element: <FullTrainsList />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "trains/leaderboard",
    element: <TrainsLeaderboard />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/trains/:trainNum",
    element: <BetterTrainsByNumber />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/trains/:trainNum/:trainDate",
    element: <BetterTrainPage />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/stations",
    element: <StationsList />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/stations/:stationCode",
    element: <StationPage />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/atlas", element: <AtlasIndex />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/atlas/delete",
    element: <AtlasDeleteAccount />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/atlas/add", element: <AtlasAdd />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/atlas/stats",
    element: <AtlasStatsInd />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/atlas/stats/all",
    element: <AtlasStatsAll />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/about_settings",
    element: <Navigate to="/about" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/about", element: <AboutPage />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/settings",
    element: <Navigate to="/about#settings" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/privacy",
    element: <Navigate to="/about#privacy" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/bippityboppityicookadameatball",
    element: <ICookaDaMeatBall />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  }
], { basename: routerBasename });

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
