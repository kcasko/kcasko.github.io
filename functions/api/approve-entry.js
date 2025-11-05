// ================================================
// TaurusTech Guestbook API — Approve Entry (Secured)
// ================================================
export async function onRequestPost({ request, env }) {
  try {
    if (!env.GUESTBOOK_KV || !env.GUESTBOOK_ADMIN_KEY)
      throw new Error("Missing environment bindings");

    // === Check Moderator Access Key ===
    const authHeader = request.headers.get("X-Guestbook-Key");
    if (authHeader !== env.GUESTBOOK_ADMIN_KEY) {
      return jsonResponse({ success: false, message: "Unauthorized" }, 403);
    }

    const { id } = await request.json();
    if (!id) return jsonResponse({ success: false, message: "Missing entry ID." }, 400);

    const key = `entry:${id}`;
    const entry = await env.GUESTBOOK_KV.get(key, { type: "json" });
    if (!entry) return jsonResponse({ success: false, message: "Entry not found." }, 404);

    entry.status = "approved";
    await env.GUESTBOOK_KV.put(key, JSON.stringify(entry));

    console.log(`✅ Entry approved: ${id}`);
    return jsonResponse({ success: true, message: "Entry approved." });
  } catch (error) {
    console.error("❌ Error approving entry:", error);
    return jsonResponse({ success: false, message: "Server error approving entry." }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://taurustech.me",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
