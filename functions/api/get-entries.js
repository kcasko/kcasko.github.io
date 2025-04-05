// functions/api/get-entries.js

export async function onRequestGet({ env }) {
  try {
    // List all keys in the namespace
    const list = await env.GUESTBOOK_KV.list();
    const keys = list.keys;

    // Get all values concurrently
    const promises = keys.map(key => env.GUESTBOOK_KV.get(key.name, { type: 'json' }));
    const values = await Promise.all(promises);

    // Filter for approved entries and ensure they are valid objects
    const approvedEntries = values
      .filter(entry => entry && entry.status === 'approved') // <<< ONLY GET APPROVED
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first

    return new Response(JSON.stringify(approvedEntries), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 60 seconds
        },
    });

  } catch (error) {
    console.error("Error getting entries:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch entries' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}