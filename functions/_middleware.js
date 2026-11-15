import { getPageMeta, buildHeadTags } from "../src/components/pageMeta.js";

class RemoveElement {
  element(element) {
    element.remove();
  }
}

// runs on every request, but only rewrites html pages (including /fr/... and /es/...)
export async function onRequest(context) {
  const { request, next } = context;
  const res = await next();

  if (request.method !== "GET" && request.method !== "HEAD") return res;
  if (res.status !== 200) return res; // ie 304 not modified
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) return res;

  const meta = await getPageMeta(new URL(request.url));
  if (meta.redirect) return Response.redirect(meta.redirect, 302);

  // pages that don't exist still get the app (so the user sees the app's not found page), just with a 404 status
  const response = new Response(res.body, { status: meta.status, headers: res.headers });

  return new HTMLRewriter()
    .on("html", { element: (element) => element.setAttribute("lang", meta.locale) })
    .on("title", { element: (element) => element.setInnerContent(meta.title) })
    .on('meta[name="description"]', { element: (element) => element.setAttribute("content", meta.description) })
    .on('meta[property^="og:"]', new RemoveElement())
    .on('link[rel="canonical"]', new RemoveElement())
    .on('link[rel="alternate"][hreflang]', new RemoveElement())
    .on("head", { element: (element) => element.append(buildHeadTags(meta), { html: true }) })
    .transform(response);
}
