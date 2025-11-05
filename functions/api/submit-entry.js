// ================================================
// TaurusTech Guestbook API — Submit Entry
// Stores user submissions in KV (pending moderation)
// ================================================

// Lightweight sanitization (for plain text)
function sanitize(input) {
  if (!input) return "";
  return input
    .toString()
    .replace(/[<>]/g, "")              // Remove HTML tags entirely
    .replace(/\s+/g, " ")              // Collapse whitespace
    .trim();
}

export async function onRequestPost({ request, env }) {
  try {
    // Validate KV binding
    if (!env.GUESTBOOK_KV) {
      throw new Error("Missing GUESTBOOK_KV binding in environment");
    }

    // Parse form data
    const formData = await request.formData();
    const name = sanitize(formData.get("name"));
    const message = sanitize(formData.get("message"));

    // --- Basic validation ---
    if (!name || !message) {
      return jsonResponse({ success: false, message: "Name and message are required." }, 400);
    }

    if (name.length > 50) {
      return jsonResponse({ success: false, message: "Name too long (max 50 chars)." }, 400);
    }

    if (message.length > 500) {
      return jsonResponse({ success: false, message: "Message too long (max 500 chars)." }, 400);
    }

    // --- Optional rate limiting (per IP) ---
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const throttleKey = `rate_${clientIP}`;
    const recent = await env.GUESTBOOK_KV.get(throttleKey);
    if (recent) {
      return jsonResponse({ success: false, message: "Please wait before submitting again." }, 429);
    }
    await env.GUESTBOOK_KV.put(throttleKey, "1", { expirationTtl: 60 }); // 1 minute cooldown

    // --- Prepare entry ---
    const entryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const entryData = {
      id: entryId,
      name,
      message,
      timestamp,
      status: "pending" // requires manual approval before being public
    };

    // --- Store entry ---
    await env.GUESTBOOK_KV.put(entryId, JSON.stringify(entryData));

    console.log(`✅ Guestbook entry submitted: ${entryId} (${clientIP})`);

    return jsonResponse({
      success: true,
      message: "Entry submitted for moderation. Thank you!"
    });

  } catch (error) {
    console.error("❌ Error submitting entry:", error);
    return jsonResponse({ success: false, message: "Server error submitting entry." }, 500);
  }
}

// --- Helper: Consistent JSON Response ---
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
