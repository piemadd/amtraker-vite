import React, { useEffect, useState } from "react";
import stringToHash from "./stringToHash";

const SenseList = (props) => {
  const { dataAdSlot } = props;
  const [isAdBlocked, setIsadBlocked] = useState(false);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle ? window.adsbygoogle : []).push(
        {}
      );
    } catch (e) {}
  }, []);

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

  console.log("is adblocked", isAdBlocked);

  if (!isAdBlocked) {
    return (
      <div
        className={
          "terrabanner terrabanner-actually bnr-threehundredtimestwofifty"
        }
      >
        <ins
          className='adsbygoogle'
          style={{ display: "block", minWidth: "250px" }}
          data-ad-format='fluid'
          data-ad-layout-key='-fb+5w+4e-db+86'
          data-ad-client='ca-pub-1957239635288103'
          data-ad-slot={dataAdSlot}
        ></ins>
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
};

export default SenseList;
