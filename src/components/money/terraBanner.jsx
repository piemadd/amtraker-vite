import { useEffect, useRef, useState } from "react";
import stringToHash from "./stringToHash";
//import { useDetectAdBlock } from "adblock-detect-react";

export default function Banner() {
  const banner = useRef();
  const [isAdBlocked, setIsadBlocked] = useState(false);

  useEffect(() => {
    fetch("https://static.cloudflareinsights.com/beacon.min.js", {
      method: "HEAD",
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setIsadBlocked(false);
          console.log("no adblock");
        } else {
          setIsadBlocked(true);
          console.log("adblock");
        }

        stringToHash(localStorage.getItem("passphrase")).then((hash) => {
          console.log("passphrase hash", hash);
          if (
            hash ==
              "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
            hash ==
              "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
          ) {
            setIsadBlocked(true);
          } else {
            setIsadBlocked(false);
          }
        });
      })
      .catch((err) => {
        setIsadBlocked(true);
        console.log("adblock");
      });
  }, []);

  const atOptions = {
    key: "9dad271020f4eb36e74568ba1aaaac3e",
    format: "iframe",
    height: 250,
    width: 300,
    params: {},
  };
  /*
  useEffect(() => {
    if (!banner.current.firstChild) {
      const conf = document.createElement("script");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`;
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

      if (banner.current) {
        banner.current.append(conf);
        banner.current.append(script);
      }
    }
  }, []);
  */

  console.log("is adblocked", isAdBlocked);

  return null;

  if (!isAdBlocked) {
    return (
      <div
        className={
          "terrabanner terrabanner-actually bnr-threehundredtimestwofifty"
        }
      >
        <img src='/content/images/ad.jpg' alt='Placeholder ad image.'></img>
      </div>
    );
  } else {
    return (
      <div className={"terrabanner bnr-threehundredtimestwofifty"}>
        Looks like you're using adblocker. While I respect your decision to
        block ads, if you'd like to support Amtraker financially, please
        consider disabling your adblocker for this site. Thank you!
      </div>
    );
  }
}
