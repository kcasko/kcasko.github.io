// ================================================
// TaurusTech Guestbook API — Get Pending Entries
// ================================================
export async function onRequestGet({ env }) {
  try {
    if (!env.GUESTBOOK_KV) throw new Error("Missing GUESTBOOK_KV binding");
    const { keys } = await env.GUESTBOOK_KV.list();
    if (!keys.length) return jsonResponse([]);

    const results = await Promise.allSettled(
      keys.map(k => env.GUESTBOOK_KV.get(k.name, { type: "json" }))
    );

    const pending = results
      .filter(r => r.status === "fulfilled" && r.value?.status === "pending")
      .map(r => r.value)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return jsonResponse(pending);
  } catch (error) {
    console.error("❌ Error fetching pending entries:", error);
    return jsonResponse({ error: "Failed to load pending entries" }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://taurustech.me",
    },
  });
}
