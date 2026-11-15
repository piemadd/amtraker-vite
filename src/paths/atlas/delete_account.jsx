import { useNavigate } from "react-router";
import { useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";
import { m } from "../../paraglide/messages.js";
import LanguageButtons from "../../components/buttons/languageButtons";
import UnitsButton from "../../components/buttons/unitsButton";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasDeleteAccount = () => {
  const navigate = useNavigate();

  document.title = m["pages.atlas.delete_account.page_title"]();
  document
    .querySelector('meta[name="description"]')
    .setAttribute(
      "content",
      m["pages.atlas.delete_account.meta_description"]()
    );
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", "https://amtraker.com/content/images/amtraker-back.webp");

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  console.log(pb.authStore);

  if (pb.authStore.isValid || pb.authStore.baseModel) {
    return (
      <>
        <img
          id="background"
          alt={m["common_strings.background_alt"]()}
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
              {m["common_strings.back"]()}
            </p>
            <div className="multiButtonHolder" style={{ alignItems: "center" }}>
              <UnitsButton headerStyle={true} />
              <LanguageButtons headerStyle={true} />
              <p
                onClick={() => {
                  const confirmationRes = confirm(m["common_strings.log_out_confirm"]());
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
                {m["common_strings.log_out"]()}
              </p>
            </div>
          </div>
          <section className="section-trainPage">
            <AtlasNav
              currentRoute={"delete_account"}
              userData={pb.authStore.record}
            />
            <h2>{m["pages.atlas.account_deletion"]()}</h2>
            <label>
              {m["pages.atlas.delete_account.explanation"]()}
            </label>
            <button
              className="links"
              onClick={async () => {
                if (
                  confirm(
                    m["pages.atlas.delete_account.confirm"](),
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
              {m["pages.atlas.delete_account.button"]()}
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
