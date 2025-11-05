// ================================================
// TaurusTech Guestbook API — Submit Entry (Final)
// Stores user submissions in KV (pending moderation)
// ================================================

function sanitize(input) {
  if (!input) return "";
  return input.toString()
    .replace(/[<>]/g, "")     // Remove HTML tags
    .replace(/\s+/g, " ")     // Collapse whitespace
    .trim();
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GUESTBOOK_KV) throw new Error("Missing GUESTBOOK_KV binding");

    const formData = await request.formData();
    const name = sanitize(formData.get("name"));
    const message = sanitize(formData.get("message"));

    if (!name || !message)
      return jsonResponse({ success: false, message: "Name and message are required." }, 400);

    if (name.length > 50)
      return jsonResponse({ success: false, message: "Name too long (max 50 chars)." }, 400);

    if (message.length > 500)
      return jsonResponse({ success: false, message: "Message too long (max 500 chars)." }, 400);

    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const throttleKey = `rate:${clientIP}`;
    const recent = await env.GUESTBOOK_KV.get(throttleKey);
    if (recent)
      return jsonResponse({ success: false, message: "Please wait before submitting again." }, 429);

    await env.GUESTBOOK_KV.put(throttleKey, "1", { expirationTtl: 60 });

    const entryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const entryData = {
      id: entryId,
      name,
      message,
      timestamp,
      status: "pending"
    };

    await env.GUESTBOOK_KV.put(`entry:${entryId}`, JSON.stringify(entryData));

    console.log(`✅ Guestbook entry submitted: ${entryId} (${clientIP})`);

    return jsonResponse({ success: true, message: "Entry submitted for moderation. Thank you!" });

  } catch (error) {
    console.error("❌ Error submitting entry:", error);
    return jsonResponse({ success: false, message: "Server error submitting entry." }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://taurustech.me",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
