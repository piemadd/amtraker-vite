import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import stringToHash from "../../components/money/stringToHash";

const VotePage = () => {
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
          <h1>2024 Election</h1>
          <ul>
            <li>
              <h3>Amtraker isn't Apolitical</h3>
              <ul>
                <li>
                  It's no secret that the ability for passenger rail in the US, especially Amtrak, to exist depends heavily on funding from DC and states. While Amtraker is completely independent from Amtrak, there is no doubt that we want Amtrak to thrive and succeed, and for that reason we believe this election is as important as ever for passenger rail in the United States.
                </li>
              </ul>
            </li>
            <li>
              <h3>Trump and Transit</h3>
              <ul>
                <li>
                  Donald Trump, along with republicans in general, have established a history of voting against, or even <a href="https://apnews.com/article/7a9b03eed47a44c986a1a2f06d0a6c4e" target="_blank">actively withdrawling</a> funding for various rail projects. It's pretty simple: conservatives don't want to fund transit, Amtrak included. There is <a href="https://archive.is/gaqqR" target="_blank">no doubt</a> that if republicans, Trump included, win the 2024 election, Amtrak's ability to run will be at risk. The services most at risk are Amtrak's long distance routes, which tend to serve more rural areas: areas which are usually made up of more conservatives and republicans.
                </li>
              </ul>
            </li>
            <li>
              <h3>Funding under the Biden Administration</h3>
              <ul>
                <li>
                  While i'm not here to absolutely shill for the Democrats (believe me, I do have my issues with the party), there is no doubt passenger rail in the US has a much brighter outlook with democrats in control. The past few years of funding for <a href="https://www.amtrak.com/about-amtrak/new-era/fleet-projects/amtrak-airo.html" target="_blank">new rolling stock</a>, <a href="https://amtraknewera.com/fdt/" target="_blank">multiple</a> <a href="https://www.amtrak.com/about-amtrak/new-era/infrastructure-projects/portal-north-bridge.html" target="_blank">historical</a> <a href="https://www.amtrak.com/about-amtrak/new-era/infrastructure-projects/hudson-tunnel.html" target="_blank">infrastructure</a> <a href="https://media.amtrak.com/2024/10/amtrak-receives-federal-grants-to-improve-chicago-service-and-support-partner-projects-across-the-midwest/" target="_blank">investments</a>, and <a href="https://www.dot.state.mn.us/passengerrail/borealis/index.html" target="_blank">new</a> and <a href="https://www.illinois.gov/news/press-release.26577.html" target="_blank">improved </a> services has made me feel good about the future about rail in the us, and I hope to stay that way.</li>
              </ul>
            </li>
            <li>
              <h3>Pro Worker and Pro Union</h3>
              <ul>
                <li>While I am not an Amtrak employee, I am a unionized rail worker. Multiple unions have endorsed the Harris/Walz ticket, including the two major rail unions in the US: <a href="https://www.smart-union.org/smart-td-endorses-vice-president-kamala-harris-for-president-a-commitment-to-two-person-crews-and-worker-safety/" target="_blank">SMART-TD</a> and <a href="https://ble-t.org/news/teamsters-rail-conference-endorses-vice-president-kamala-harris-for-president/" target="_blank">BLE-T</a>.</li>
              </ul>
            </li>
            <li>
              <h3>Vote Down the Ballot</h3>
              <ul>
                <li>Voting down the ballot is even more important than voting for the president, as your representatives and senators, <i>especially</i> at the state and local level, are going to have a much larger impact on your life than one person in the executive branch of the federal government. A large number of rail projects couldn't happen without the assistance of state and local funding, so also making sure to vote in these elections is especially important.</li>
              </ul>
            </li>
            <li>
              <h3>GO VOTE!!!</h3>
              <ul>
                <li>There are many great resources out there on how to register, where to vote, and what is on your ballot, but a great nonpartisan resource is <a href="https://www.vote.org/" target="_blank">Vote.org</a>. I cannot recommend it enough. While most states won't let you register on election day, <a href="https://archive.is/vZGZc" target="_blank">23/51 states allow it, so it might not be too late</a>.</li>
              </ul>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default VotePage;
