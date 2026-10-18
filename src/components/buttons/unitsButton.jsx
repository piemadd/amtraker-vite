import { m } from "../../paraglide/messages.js";
import { useUnits, setUnits } from "../units.js"

const UnitsButton = ({ headerStyle = false }) => {
  const units = useUnits();
  const label = units === "metric" ? m["common_strings.units.switch_to_imperial"]() : m["common_strings.units.switch_to_metric"]();

  return (
    <div style={{ display: "flex", alignItems: "center", height: headerStyle ? "75%" : null }}>
      <button
        className="root"
        title={label}
        aria-label={label}
        style={{
          fontSize: "18px",
          width: "48px",
          height: headerStyle ? "100%" : "48px",
          textAlign: "center",
          lineHeight: headerStyle ? "20px" : "0px",
          paddingTop: headerStyle ? "calc(0.5em - 2px)" : null
        }}
        onClick={() => setUnits(units === "metric" ? "imperial" : "metric")}
      >
        {units === "metric" ? "km" : "mi"}
      </button>
    </div>
  );
};

export default UnitsButton;
