export async function onRequestGet({ env }) {
  try {
    if (!env.GUESTBOOK_KV) throw new Error("Missing GUESTBOOK_KV binding");

    const { keys } = await env.GUESTBOOK_KV.list();
    const results = await Promise.allSettled(
      keys.map(k => env.GUESTBOOK_KV.get(k.name, { type: "json" }))
    );

    const pending = results
      .filter(r => r.status === "fulfilled" && r.value?.status === "pending")
      .map(r => r.value)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify(pending), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://taurustech.me",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
