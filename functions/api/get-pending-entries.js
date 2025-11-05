// ================================================
// TaurusTech Guestbook API — Get Pending Entries (CORS-Safe Final)
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

export async function onRequestGet({ request, env }) {
  try {
    if (!env.GUESTBOOK_KV)
      throw new Error("Missing GUESTBOOK_KV binding");

    const { keys } = await env.GUESTBOOK_KV.list();
    if (!keys || keys.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          ...getCorsHeaders(request),
          "Content-Type": "application/json"
        }
      });
    }

    const results = await Promise.allSettled(
      keys.map((k) => env.GUESTBOOK_KV.get(k.name, { type: "json" }))
    );

    const pending = results
      .filter((r) => r.status === "fulfilled" && r.value?.status === "pending")
      .map((r) => r.value)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify(pending), {
      status: 200,
      headers: {
        ...getCorsHeaders(request),
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Error fetching pending entries:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...getCorsHeaders(request),
        "Content-Type": "application/json"
      }
    });
  }
}

// ===== Preflight Handler =====
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}
