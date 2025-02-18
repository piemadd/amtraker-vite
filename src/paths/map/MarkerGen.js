const generateMarker = (train) => {
  const additionalWidth = (train.trainNumRaw.toString().length * 32) + (train.trainID.split('-')[1].length * 8);
  const sizeMultiplier = 1.25;

  const svgTemplate = `
<svg
  width='${(176 + additionalWidth) * sizeMultiplier}px'
  height='${96 * sizeMultiplier}px'
  viewBox='0 0 ${176 + additionalWidth} 96'
  fill='none'
  xmlns='http://www.w3.org/2000/svg'
>
  <g>
    <rect
      x='0'
      y='0'
      width='${176 + additionalWidth}'
      height='96'
      rx='16'
      fill='black'
    />
    <rect
      x='8'
      y='8'
      width='${160 + additionalWidth}'
      height='80'
      rx='10'
      fill='${train.iconColor}'
    />
    <text x="${88 + (additionalWidth / 2)}" y="68" fill="white" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="60" letter-spacing="0em" text-anchor="middle"><tspan font-size="40">${train.providerShort.substring(0, 1)}</tspan>${train.trainNumRaw}<tspan font-size="40">(${train.trainID.split('-')[1]})</tspan></text>
    </g>
</svg>`

  return {
    imageWidth: (176 + additionalWidth) * sizeMultiplier,
    imageHeight: 96 * sizeMultiplier,
    imageText: svgTemplate,
  }
}

export default generateMarker;