const colors = {
  early: "#62a744",
  onTime: "#62a744",
  late: "#f9a240",
  default: "#111111",
};

const MarkerIcon = ({ num, trainTimely, trainState, direction }) => {
  const trainNum = num ? num.toString() : "NULL";
  const trainDirection = direction ? direction : "none";

  let trainColor = "#111111";

  if (trainTimely) {
    if (trainTimely.includes("Early") || trainTimely.includes("On Time")) {
      trainColor = colors.early;
    }

    if (trainTimely.includes("Late") || trainTimely.includes("NaN")) {
      trainColor = colors.late;
    }

    if (
      trainState.includes("Cancelled") ||
      trainState.includes("Completed") ||
      trainState.includes("Predeparture")
    ) {
      trainColor = colors.default;
    }
  }

  return (
    <svg
      width={`${32 + 12 * trainNum.length}px`}
      height='48px'
      viewBox={`0 0 ${128 + 48 * trainNum.length} 192`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g>
        <rect
          x='32'
          y='32'
          width={64 + 48 * trainNum.length}
          height='128'
          rx='44'
          fill='black'
        />
        <rect
          x='39'
          y='39'
          width={50 + 48 * trainNum.length}
          height='114'
          rx='38'
          fill={trainColor}
        />
        <text
          x={64 + 24 * trainNum.length}
          y='122'
          fill='#fff'
          fontFamily='monospace'
          fontSize='86px'
          textAnchor='middle'
        >
          {trainNum}
        </text>
      </g>
    </svg>
  );
};

export default MarkerIcon;
