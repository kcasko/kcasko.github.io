// ================================================
// TaurusTech Guestbook API — Delete Entry (Secured)
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
    await env.GUESTBOOK_KV.delete(key);

    console.log(`🗑️ Entry deleted: ${id}`);
    return jsonResponse({ success: true, message: "Entry deleted." });
  } catch (error) {
    console.error("❌ Error deleting entry:", error);
    return jsonResponse({ success: false, message: "Server error deleting entry." }, 500);
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
