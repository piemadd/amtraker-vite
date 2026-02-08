import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";
import TripsList from "./tripsList";

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasIndex = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [authUpdatedAt, setAuthUpdatedAt] = useState(0);
  const [tripsMeta, setTripsMeta] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  console.log(authUpdatedAt)

  if (pb.authStore.isValid) {
    return (
      <>
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
            <h2
              onClick={() => {
                const confirmationRes = confirm('Are you sure you want to log out?');
                if (!confirmationRes) return;
                pb.authStore.clear();
                navigate(0);
              }}
              className='click'
              style={{ paddingRight: '32px' }}
            >
              Log Out
            </h2>
          </div>
          <section className='section-trainPage'>
            <AtlasNav currentRoute={'index'} userData={pb.authStore.record} />
            {tripsMeta && tripsMeta.totalItems > 0 ?
              <>
                <label>Page Selection</label>
                <div className='links' style={{
                  marginBottom: '8px'
                }}>
                  {
                    Array(tripsMeta.totalPages)
                      .fill("amongus")
                      .map((val, i) => {
                        return <button
                          className={'root' + (pageNumber == i + 1 ? ' currentlyClickedButton' : '')}
                          onClick={(e) => setPageNumber(i + 1)}
                        >{i + 1}</button>
                      })
                  }
                </div>
              </> :
              null
            }
            <TripsList pb={pb} numberOfRecords={50} pageNumber={pageNumber} setTripsMeta={setTripsMeta} />
          </section>
        </div>
      </>
    );
  }

  return (
    <>
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
          <h1>Atlas</h1>
          <p>Amtraker Atlas allows you to track your Amtrak, Brightline, and VIA rail trips, similar to Flighty Passport with flights. Atlas is still in development, and more features will be added over time, but the basic functionality of adding and deleting trips is done. I wanted the basic functionality to be released before the new year. Enjoy, and please let me know (<a href="mailto:piero@piemadd.com">piero@piemadd.com</a>) if you have any issues or recommendations!</p>
          <button className='root' onClick={async () => {
            await pb.collection('users').authWithOAuth2({ provider: 'google' });
            setAuthUpdatedAt(Date.now());
          }}>Login With Google</button>
          <p>===== or =====</p>
          <label htmlFor="atlas-login_email">Email</label>
          <input
            name="login_email"
            id="atlas-login_email"
            onChange={e => setCurrentUsername(e.target.value)}
            value={currentUsername}
            type="email"
          />
          <label htmlFor="atlas-login_password">Password</label>
          <input
            name="login_password"
            id="atlas-login_password"
            onChange={e => setCurrentPassword(e.target.value)}
            type='password'
            value={currentPassword}
          />
          <button className='root' onClick={async () => {
            await pb.collection('users').authWithPassword(
              currentUsername,
              currentPassword,
            );
            setAuthUpdatedAt(Date.now());
          }}>Login With User/Pass</button>
        </section>
      </div>
    </>
  );
};

export default AtlasIndex;
