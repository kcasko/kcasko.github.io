// ================================================
// TaurusTech Guestbook API — Get Approved Entries
// Fetches approved guestbook entries from KV storage
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

export async function onRequestGet({ env }) {
  try {
    // Validate KV binding
    if (!env.GUESTBOOK_KV) {
      throw new Error("Missing GUESTBOOK_KV binding in environment");
    }

    // List keys in the namespace
    const { keys } = await env.GUESTBOOK_KV.list();

    if (!keys || keys.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30"
        }
      });
    }

    // Fetch all entries concurrently
    const results = await Promise.allSettled(
      keys.map(k => env.GUESTBOOK_KV.get(k.name, { type: "json" }))
    );

    // Extract valid JSON values only
    const entries = results
      .filter(r => r.status === "fulfilled" && r.value)
      .map(r => r.value);

    // Filter for approved entries
    const approvedEntries = entries
      .filter(e => e.status === "approved")
      .sort((a, b) => {
        const tA = new Date(a.timestamp || 0);
        const tB = new Date(b.timestamp || 0);
        return tB - tA; // newest first
      });

    return new Response(JSON.stringify(approvedEntries, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30"
      }
    });

  } catch (error) {
    console.error("❌ Guestbook get-entries error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch entries" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
