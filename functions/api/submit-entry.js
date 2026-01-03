// ================================================
// TaurusTech Guestbook API — Submit Entry (CORS-Safe Final)
// Stores user submissions in KV (pending moderation)
// ================================================

function sanitize(input) {
  if (!input) return "";
  return input.toString()
    .replace(/[<>]/g, "")     // Remove HTML tags
    .replace(/\s+/g, " ")     // Collapse whitespace
    .trim();
}

// Spam detection
function isSpam(name, message) {
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'winner', 'congratulations', 'bitcoin', 'crypto',
    'investment', 'earn money', 'make money', 'click here', 'visit now', 'free money',
    'limited time', 'act now', 'urgent', 'http://', 'https://', 'www.', '.com', '.net',
    'telegram', 'whatsapp', 'contact me', 'email me'
  ];
  
  const combined = (name + ' ' + message).toLowerCase();
  return spamKeywords.some(keyword => combined.includes(keyword));
}

function isSuspiciousPattern(name, message) {
  // Check for excessive repetition
  if (/(.{3,})\1{3,}/.test(message)) return true;
  
  // Check for excessive caps
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.5 && message.length > 10) return true;
  
  // Check for suspicious characters
  const combined = (name + ' ' + message).toLowerCase();
  if (/[^\w\s.,!?'"()-]/.test(combined)) return true;
  
  return false;
}

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
    if (!env.GUESTBOOK_KV)
      throw new Error("Missing GUESTBOOK_KV binding");

    const formData = await request.formData();
    const name = sanitize(formData.get("name"));
    const message = sanitize(formData.get("message"));
    const honeypot = formData.get("email"); // Honeypot field

    // Honeypot check - if filled, it's likely a bot
    if (honeypot)
      return jsonResponse(request, { success: false, message: "Invalid submission." }, 400);

    if (!name || !message)
      return jsonResponse(request, { success: false, message: "Name and message are required." }, 400);

    if (name.length > 50)
      return jsonResponse(request, { success: false, message: "Name too long (max 50 chars)." }, 400);

    if (message.length > 500)
      return jsonResponse(request, { success: false, message: "Message too long (max 500 chars)." }, 400);

    // Enhanced spam detection
    if (isSpam(name, message))
      return jsonResponse(request, { success: false, message: "Entry contains prohibited content." }, 400);

    if (isSuspiciousPattern(name, message))
      return jsonResponse(request, { success: false, message: "Entry contains suspicious patterns." }, 400);

    // Referrer check - must come from your domains
    const referer = request.headers.get("Referer");
    const allowedDomains = ["https://taurustech.me", "https://74f3577a.kcasko-github-io.pages.dev"];
    if (!referer || !allowedDomains.some(domain => referer.startsWith(domain)))
      return jsonResponse(request, { success: false, message: "Invalid request origin." }, 403);

    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    
    // Stricter rate limiting - 5 minutes instead of 1
    const throttleKey = `rate:${clientIP}`;
    const recent = await env.GUESTBOOK_KV.get(throttleKey);
    if (recent)
      return jsonResponse(request, { success: false, message: "Please wait 5 minutes before submitting again." }, 429);

    await env.GUESTBOOK_KV.put(throttleKey, "1", { expirationTtl: 300 });

    const entryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const entryData = {
      id: entryId,
      name,
      message,
      timestamp,
      status: "approved"
    };

    await env.GUESTBOOK_KV.put(`entry:${entryId}`, JSON.stringify(entryData));

    console.log(`✅ Guestbook entry submitted: ${entryId} (${clientIP})`);

    return jsonResponse(request, {
      success: true,
      message: "Entry added successfully. Thank you!"
    });

  } catch (error) {
    console.error("❌ Error submitting entry:", error);
    return jsonResponse(request, { success: false, message: "Server error submitting entry." }, 500);
  }
}

// ===== Shared JSON Response Helper =====
function jsonResponse(request, obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" }
  });
}

// ===== Preflight Handler =====
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}
