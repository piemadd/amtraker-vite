import { useRouteError } from "react-router-dom";
import { useEffect } from "react";

export default function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  const errorString = error.toString();

  console.log(errorString);

  if (errorString.includes("error loading dynamically imported module")) {
    useEffect(() => {
      console.log("clearing cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "mapbox-tiles") caches.delete(key);
        });

        console.log("cleared cache!");
        caches.keys().then((newKeys) => console.log("new caches:", newKeys));
      });

      window.location.reload();
    });

    return (
      <div id='error-page'>
        <h1>Oops!</h1>
        <p>
          Seems like an old version of Amtraker tried to load. We'll fix that
          right up for you and you'll be on your way!
        </p>
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
            Current version: v3.6.0
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
        <p>
          If the error number below doesn't match up with the error number on
          the home page, chances are your error has already been fixed. If so,
          clearing your cache should fix the issue.
        </p>
        <br />
        <p>
          <i>
            Current path: {window.location.href}
            <br />
            Current version: v3.6.0
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
