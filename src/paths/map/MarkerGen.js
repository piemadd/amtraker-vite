const generateMarker = (train) => {
  const calculatedWidth = 
    72 + // first letter length + parenthesis (24px per character)
    train.trainNumRaw.toString().length * 36 + // train number length
    train.trainID.split('-')[1].length * 24 + // train date length (second part of id),
    40 // extra padding


  const sizeMultiplier = 1.25;

  const svgTemplate = `
<svg
  width='${calculatedWidth * sizeMultiplier}px'
  height='${96 * sizeMultiplier}px'
  viewBox='0 0 ${calculatedWidth} 96'
  fill='none'
  xmlns='http://www.w3.org/2000/svg'
>
  <g>
    <rect
      x='0'
      y='0'
      width='${calculatedWidth}'
      height='96'
      rx='16'
      fill='black'
    />
    <rect
      x='8'
      y='8'
      width='${calculatedWidth - 16}'
      height='80'
      rx='10'
      fill='${train.iconColor}'
    />
    <text x="${calculatedWidth / 2}" y="68" fill="white" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="60" letter-spacing="0em" text-anchor="middle"><tspan font-size="40">${train.providerShort.substring(0, 1)}</tspan>${train.trainNumRaw}<tspan font-size="40">(${train.trainID.split('-')[1]})</tspan></text>
    </g>
</svg>`

  console.log(svgTemplate)

  return {
    imageWidth: calculatedWidth * sizeMultiplier,
    imageHeight: 96 * sizeMultiplier,
    imageText: svgTemplate,
  }
}

export default generateMarker;