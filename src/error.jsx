import { useRouteError } from "react-router-dom";
import { useEffect } from "react";

export default function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  const errorString = error.toString();

  console.log(errorString);

  if (
    errorString.includes("error loading dynamically imported module") ||
    errorString.includes("Failed to fetch dynamically imported module") ||
    errorString.includes("dynamically imported module") ||
    errorString.includes("'text/html' is not a valid JavaScript MIME type") ||
    errorString.includes("Unable to preload CSS for") ||
    errorString.includes("module script failed")
  ) {
    useEffect(() => {
      console.log("clearing cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "mapbox-tiles") caches.delete(key);
        });

        console.log("cleared cache!");
        caches.keys().then((newKeys) => console.log("new caches:", newKeys));
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    return (
      <div id='error-page'>
        <h2>Cache Update</h2>
        <p>Amtraker's cache needed to be updated.</p>
        <br />
        <p>Reloading in 2 seconds...</p>
      </div>
    );
  } else if (error.status === 404) {
    return (
      <div id='error-page'>
        <h1>404 - Not Found</h1>
        <p>Seems like that page doens't exist.</p>
        <p>
          Please copy the following and email it to me (piero@piemadd.com) so I
          can debug and fix the issue. Thanks, and apologies for the
          inconvenience.
        </p>
        <p>
          <i>
            Current path: {window.location.href}
            <br />
            Current version: v3.17.4 P7
            <br />
            Current date and time (UTC): {new Date().toUTCString()}
            <br />
            Current date and time (local): {new Date().toLocaleString()}
            <br />
            {errorString}
          </i>
        </p>
      </div>
    );
  } else {
    return (
      <div id='error-page'>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          Please copy the following and email it to me (piero@piemadd.com) so I
          can debug and fix the issue. Thanks, and apologies for the
          inconvenience.
        </p>
        <br />
        <p>
          <i>
            Current path: {window.location.href}
            <br />
            Current version: v3.17.4 P7
            <br />
            Current date and time (UTC): {new Date().toUTCString()}
            <br />
            Current date and time (local): {new Date().toLocaleString()}
            <br />
            {errorString}
          </i>
        </p>
      </div>
    );
  }
}
