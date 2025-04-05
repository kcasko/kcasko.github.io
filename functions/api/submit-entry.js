// functions/api/submit-entry.js

// Basic Sanitization (replace with a more robust library like DOMPurify if needed for HTML)
function sanitize(str) {
  if (!str) return '';
  str = str.toString();
  // Very basic: replace HTML tags characters. Consider a library for real use.
  return str.replace(/</g, "<").replace(/>/g, ">");
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const name = sanitize(formData.get('name'));
    const message = sanitize(formData.get('message'));

    // Basic Validation
    if (!name || !message) {
      return new Response(JSON.stringify({ success: false, message: 'Name and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (name.length > 50 || message.length > 500) {
       return new Response(JSON.stringify({ success: false, message: 'Input too long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entryId = crypto.randomUUID(); // Generate a unique ID
    const timestamp = new Date().toISOString();
    const status = 'pending'; // <<< REQUIRES MANUAL APPROVAL

    const entryData = {
      name,
      message,
      timestamp,
      status,
    };

    // Store in KV
    // Key: Use timestamp + unique ID for potential sorting later if needed, or just ID
    // Value: The entry data as a JSON string
    await env.GUESTBOOK_KV.put(entryId, JSON.stringify(entryData));

    return new Response(JSON.stringify({ success: true, message: 'Entry submitted for moderation.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error submitting entry:", error);
    return new Response(JSON.stringify({ success: false, message: 'Server error submitting entry.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}