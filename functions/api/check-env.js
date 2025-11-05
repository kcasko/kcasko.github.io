export async function onRequestGet({ request, env }) {
  return new Response(
    JSON.stringify(
      {
        hasKV: !!env.GUESTBOOK_KV,
        hasAdminKey: !!env.GUESTBOOK_ADMIN_KEY,
        receivedHeader: request.headers.get("X-Guestbook-Key") || null
      },
      null,
      2
    ),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}
