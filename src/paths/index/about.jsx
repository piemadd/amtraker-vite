import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import stringToHash from "../../components/money/stringToHash";

const AboutPage = () => {
  const navigate = useNavigate();
  const [bgURL, setBGURL] = useState("/content/images/amtraker-bg.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
        "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });
  }, []);

  return (
    <>
      <img
        id='background'
        alt='Amtrak network map.'
        className={bgClass}
        src={bgURL}
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className='click'
          >
            Back
          </h2>
        </div>
        <section className='section-trainPage'>
          <h1>About Amtraker</h1>
          <h2>FAQs</h2>
          <ul>
            <li id='faq-what-is-amtraker'>
              <h3>What is Amtraker?</h3>
              <ul>
                <li>
                  Amtraker is a website and app that allows you to track Amtrak
                  trains in real time.
                </li>
              </ul>
            </li>
            <li id='faq-data-source'>
              <h3>Where does your data come from?</h3>
              <ul>
                <li>
                  Amtraker pulls its data from{" "}
                  <a
                    href='https://www.amtrak.com/track-your-train.html'
                    target='_blank'
                  >
                    Amtrak's official tracking map
                  </a>{" "}
                  and rehosts it on our servers.
                </li>
              </ul>
            </li>
            <li id='faq-dev'>
              <h3>Can I use your data?</h3>
              <ul>
                <li>
                  Yes! Amtraker's data is available for use for free, as long as
                  you don't spam the API ofc. You can find the API documentation{" "}
                  <a href='https://github.com/piemadd/amtrak'>here</a>. Let me
                  know any issues you have with the API by emailing me at{" "}
                  <a href='mailto:dev@amtraker.com'>dev@amtraker.com</a>.
                </li>
              </ul>
            </li>
            <li id='faq-installing'>
              <h3>Can I install Amtraker as an App?</h3>
              <ul>
                <li>
                  This depends on what device you're using. If you're using an
                  Android device, head on over to{" "}
                  <a
                    href='https://play.google.com/store/apps/details?id=com.amtrak.piero'
                    target='_blank'
                  >
                    Google Play
                  </a>{" "}
                  to install the App. If you're using an iPhone, open Amtraker
                  in Safari, press the share button (box with an arrow pointing
                  up), and press "Add to home screen". Then, you should be able
                  to press "Add" in the top right, which will "install" Amtraker
                  on your iPhone. I do plan on bringing Amtraker to the App
                  store in the future, but this is all I can provide for iOS
                  users for now.
                </li>
              </ul>
            </li>
            <li id='faq-feedback'>
              <h3>
                How can I give feedback, report a bug, and/or request a feature?
              </h3>
              <ul>
                <li>
                  You can email me at{" "}
                  <a href='mailto:hi@amtraker.com'>hi@amtraker.com</a>, or you
                  can submit feedback via the{" "}
                  <a
                    href='https://forms.gle/Fp6fVc2wqVLZKXKq9'
                    target='__blank'
                  >
                    Google Form
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li id='faq-stale'>
              <h3>What does it mean when the data is stale?</h3>
              <ul>
                <li>
                  When, on average, Amtrak hasn't updated their tracking data
                  for more than 15 minutes, the data is outdated and inaccurate.
                  This is usually due to Amtrak's servers having issues.
                </li>
              </ul>
            </li>
            <li id='faq-not-tracking'>
              <h3>Why isn't my train tracking?</h3>
              <ul>
                <li>
                  Amtraker only shows the data available to it. If Amtrak isn't
                  tracking your train, Amtraker won't be able to either. If the
                  train, for whatever reason, is tracking on the official
                  tracker, but not on Amtraker, please{" "}
                  <a href='mailto:hi@amtraker.com'>email me</a> and I'll look as
                  soon as I can.
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
