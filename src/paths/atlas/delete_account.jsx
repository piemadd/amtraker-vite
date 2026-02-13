import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasDeleteAccount = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  console.log(pb.authStore);

  if (pb.authStore.isValid || pb.authStore.baseModel) {
    return (
      <>
        <img
          id="background"
          alt="Amtrak network map."
          className={bgClass + " terrabanner"}
          src={bgURL}
        ></img>
        <div className="trainPage">
          <div className="header-trainpage">
             <p
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className='click'
              style={{ 
                paddingLeft: '32px',
                fontSize: '24px',
                fontWeight: 500,
               }}
            >
              Back
            </p>
            <p
              onClick={() => {
                const confirmationRes = confirm(
                  "Are you sure you want to log out?",
                );
                if (!confirmationRes) return;
                pb.authStore.clear();
                navigate(0);
              }}
              className="click"
              style={{ 
                paddingRight: '32px',
                fontSize: '24px',
                fontWeight: 500,
               }}
            >
              Log Out
            </p>
          </div>
          <section className="section-trainPage">
            <AtlasNav
              currentRoute={"delete_account"}
              userData={pb.authStore.record}
            />
            <h2>Account Deletion</h2>
            <label>
              Deleting your account is instantaneous and irreversible. You will
              be prompted upon clicking "Delete Account" and upon confirming,
              all of your data will be gone forever.
            </label>
            <button
              className="links"
              onClick={async () => {
                if (
                  confirm(
                    'Are you sure you would like you want to delete your account? Again, this is instantaneous and irreversible. Press "OK" if so.',
                  )
                ) {
                  await pb.collection("users").delete(pb.authStore.record.id);
                  pb.authStore.clear();
                  navigate("/atlas", { replace: true });
                } else {
                  // do nothing
                }
              }}
            >
              Delete Account
            </button>
          </section>
        </div>
      </>
    );
  } else {
    navigate("/atlas", { replace: true });
  }
};

export default AtlasDeleteAccount;
