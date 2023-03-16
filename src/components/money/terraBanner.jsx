import { useEffect, useRef, useState } from "react";
import { stringToHash } from "../../paths/index/iCookaDaMeatBall";
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
          if (
            hash ==
            "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
          ) {
            setIsadBlocked(true);
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

  console.log("is adblocked", isAdBlocked);

  if (!isAdBlocked) {
    return (
      <div
        ref={banner}
        className={
          "terrabanner terrabanner-actually bnr-threehundredtimestwofifty"
        }
      ></div>
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
