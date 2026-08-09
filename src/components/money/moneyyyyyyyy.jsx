import { useEffect, useState } from "react";

const Moneyyyyyyyy = ({ sizeName = "auto", noOuter = false }) => {
  let sizeToUse = "medium_rectangle";

  if (sizeName == "auto") {
    if (window.innerHeight > 900) {
      if (window.innerWidth > 400) {
        sizeToUse = "large_rectangle";
      } else {
        sizeToUse = "medium_rectangle";
      }
    } else {
      sizeToUse = "mobile_banner";
    }
  } else {
    sizeToUse = sizeName;
  }

  const [isBlocked, setIsBlocked] = useState(false);
  const sizes = {
    large_rectangle: [336, 280, "4670423031"],
    medium_rectangle: [300, 250, "1406679457"],
    mobile_banner: [300, 50, "2399482918"],
    leaderboard: [728, 90, "6519405332"]
  };

  const thisSize = sizes[sizeToUse];

  // adding to window if not
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle ? window.adsbygoogle : []).push({});
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetch(`https://api.amtraker.com/ads/ads/adsense/adblock/ads.json?=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) setIsBlocked(true);
      })
      .catch((e) => {
        // eh
      });
  }, []);

  return (
    <div className={noOuter ? 'monay-noOuter' : "monay"}>
      <small>Advertisement</small>
      <div className="monay-inner">
        <ins
          class="adsbygoogle"
          style={{ display: "inline-block", width: thisSize[0], height: thisSize[1] }}
          data-ad-client="ca-pub-1957239635288103"
          data-ad-slot={thisSize[2]}
        ></ins>
        <div
          className="monay-message"
          style={{ width: thisSize[0], height: thisSize[1], marginBottom: 0 - thisSize[1] }}
        >
          <p>hi :3</p>
        </div>
      </div>
    </div>
  );
};

export default Moneyyyyyyyy;
