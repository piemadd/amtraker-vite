import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import stringToHash from "../../components/money/stringToHash";

const AboutPage = () => {
  const navigate = useNavigate();
  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
        "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash ==
        "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });
  }, []);

  useEffect(() => {
    const scrollingToItem = document.getElementById(window.location.hash.replace('#', ''));
    if (!scrollingToItem) return;
    scrollingToItem.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <img
        id='backgroundNew'
        alt='Map of Australia.'
        className={'bg-focus-in peppino'}
        src={'/content/images/waow.png'}
      ></img>
      <img
        id='background'
        alt='Amtrak network map.'
        className={bgClass + ' terrabanner'}
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
            style={{ paddingLeft: '32px' }}
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
                  to install the App. If you're using an iPhone, make sure you have Amtraker
                  open in Safari, and then follow these instructions from the Apple website: <a href="https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios#:~:text=to%20your%20Home-,screen,-You%20can%20add" target="blank">link</a> (look for "Add a website icon to your Home Screen"). I do plan on bringing Amtraker to the App
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
            <li id='faq-map-icons-colors'>
              <h3>What do the train icons/colors mean?</h3>
              <ul>
                <li>The colors of the icons are broken down into two categories: active and inactive trains. </li>
                <li>
                  Any train that has not yet departed its initial terminal, has arrived at its final station, or has been cancelled is inactive and will be dark grey, as shown below.
                  <br />
                  <svg
                    width='130px'
                    height='60px'
                    viewBox='0 0 208 96'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g>
                      <rect
                        x='0'
                        y='0'
                        width='208'
                        height='96'
                        rx='16'
                        fill='black'
                      />
                      <rect
                        x='8'
                        y='8'
                        width='192'
                        height='80'
                        rx='10'
                        fill='#212529'
                      />
                      <text
                        x="104"
                        y="68"
                        fill="white"
                        xmlSpace="preserve"
                        style={{
                          whiteSpace: 'pre'
                        }}
                        fontFamily="monospace"
                        fontSize="60"
                        letterSpacing="0em"
                        textAnchor="middle"><tspan fontSize="40">A</tspan>41<tspan fontSize="40">(5)</tspan></text>
                    </g>
                  </svg>
                </li>
                <li>
                  Otherwise, the shade of the train depends on how late it is, from a green for 0% late, to a an orange for 25% late, and a bright red for 100% late, with these percentegaes being of a predetermined threshold (see below) depending on the route length and type.
                  <ul>
                    <li>Green (0%) HSV(132&deg;, 69%, 54%):
                      <br />
                      <svg
                        width='130px'
                        height='60px'
                        viewBox='0 0 208 96'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <g>
                          <rect
                            x='0'
                            y='0'
                            width='208'
                            height='96'
                            rx='16'
                            fill='black'
                          />
                          <rect
                            x='8'
                            y='8'
                            width='192'
                            height='80'
                            rx='10'
                            fill='#2b8a3e'
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: 'pre'
                            }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"><tspan fontSize="40">A</tspan>41<tspan fontSize="40">(5)</tspan></text>
                        </g>
                      </svg>
                    </li>
                    <li>Orange (25%) HSV(35&deg;, 93%, 78%):
                      <br />
                      <svg
                        width='130px'
                        height='60px'
                        viewBox='0 0 208 96'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <g>
                          <rect
                            x='0'
                            y='0'
                            width='208'
                            height='96'
                            rx='16'
                            fill='black'
                          />
                          <rect
                            x='8'
                            y='8'
                            width='192'
                            height='80'
                            rx='10'
                            fill='#c77a0e'
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: 'pre'
                            }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"><tspan fontSize="40">A</tspan>41<tspan fontSize="40">(5)</tspan></text>
                        </g>
                      </svg>
                    </li>
                    <li>Red (100%) HSV(-12&deg;, 94%, 78%):
                      <br />
                      <svg
                        width='130px'
                        height='60px'
                        viewBox='0 0 208 96'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <g>
                          <rect
                            x='0'
                            y='0'
                            width='208'
                            height='96'
                            rx='16'
                            fill='black'
                          />
                          <rect
                            x='8'
                            y='8'
                            width='192'
                            height='80'
                            rx='10'
                            fill='#c70c31'
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: 'pre'
                            }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"><tspan fontSize="40">A</tspan>41<tspan fontSize="40">(5)</tspan></text>
                        </g>
                      </svg>
                    </li>
                    <li>To help differentiate the colors for those with deuteranopia and protanopia, I have made the saturation and brightness of the colors go up with the percentage, so while not perfect, there should be some level of differentation between the hues. If you have any feedback/ideas for how I can improve this, please let me know.</li>
                  </ul>
                </li>
                <li>For each route, the maximum lateness threshold largely depends on what type of route it is and who is operating said train.
                  <ul>
                    <li>All Via Corridor, Acela, Brightline, and any Amtrak trains &lt;250mi: 60min / 1hr</li>
                    <li>Amtrak trains 250mi - 349mi: 90min / 1.5hr</li>
                    <li>Amtrak trains 350mi - 449mi: 120min / 2hr</li>
                    <li>Amtrak trains 450mi+: 150min / 2.5hr</li>
                    <li>Any other Via Trains: 360min / 6hr</li>
                  </ul>
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
