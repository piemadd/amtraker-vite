class ElementHandler {
  constructor(ogtag) {
    this.ogtag = ogtag
  }
  element(element) {
    element.append(this.ogtag, { html: true })
  }
}

export async function onRequest(context) {
  const { request, next } = context
  const res = await next()
  const { searchParams, pathname } = new URL(request.url)

  if (!pathname.startsWith('/stations')) return res; // not entirely sure how we got here tbh
  if (pathname.endsWith('stations')) return res; // no station specified

  let code = pathname.split('/').at(-1);
  let ogtag

  console.log(code)
  console.log(pathname)

  const infoRes = await fetch(`http://api.amtraker.com/v3/station/${code}`);
  const infoDataRaw = await infoRes.text();

  console.log(infoDataRaw)

  const infoData = JSON.parse(infoDataRaw);

  if (Array.isArray(infoData) && infoData.length == 0) return res; // doesnt exist

  // these are the metatags we want to inject into the site
  ogtag = `
    <meta property="og:title" content="${infoData[code].name} (${code}) | Amtraker" />
    <meta property="og:description" content="Track trains to and from ${infoData[code].name}!" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="https://ogimg.transitstat.us/images?service=amtraker&type=station&code=${code}" />

    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />
  `

  const rewriter = new HTMLRewriter();
  
  rewriter.replace(/<meta\s+property="(\w|:)+"\s+content=".+"\s+\/>/, '');
  rewriter.on('head', new ElementHandler(ogtag)).transform(res);

  return rewriter;
}
