// ================================================
// TaurusTech Guestbook API — Delete Entry (CORS-Safe Final)
// ================================================

// ===== TaurusTech Global CORS Utility =====
function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  const allowed = [
    "https://taurustech.me",
    "https://74f3577a.kcasko-github-io.pages.dev"
  ];
  const corsOrigin = allowed.includes(origin)
    ? origin
    : "https://taurustech.me";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Guestbook-Key",
    "Access-Control-Max-Age": "86400"
  };
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GUESTBOOK_KV || !env.GUESTBOOK_ADMIN_KEY)
      throw new Error("Missing environment bindings");

    const key = request.headers.get("X-Guestbook-Key");
    if (key !== env.GUESTBOOK_ADMIN_KEY) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        {
          status: 403,
          headers: { ...getCorsHeaders(request), "Content-Type": "application/json" }
        }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing entry ID." }),
        {
          status: 400,
          headers: { ...getCorsHeaders(request), "Content-Type": "application/json" }
        }
      );
    }

    await env.GUESTBOOK_KV.delete(`entry:${id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Entry deleted." }),
      {
        status: 200,
        headers: { ...getCorsHeaders(request), "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error deleting entry:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { ...getCorsHeaders(request), "Content-Type": "application/json" }
      }
    );
  }
}

// ===== Preflight Handler =====
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}
