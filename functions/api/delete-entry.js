export async function onRequestPost({ request, env }) {
  try {
    if (!env.GUESTBOOK_KV || !env.GUESTBOOK_ADMIN_KEY)
      throw new Error("Missing environment bindings");

    const key = request.headers.get("X-Guestbook-Key");
    if (key !== env.GUESTBOOK_ADMIN_KEY)
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    const { id } = await request.json();
    if (!id)
      return new Response(JSON.stringify({ success: false, message: "Missing entry ID." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    await env.GUESTBOOK_KV.delete(`entry:${id}`);

    return new Response(JSON.stringify({ success: true, message: "Entry deleted." }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://taurustech.me",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
