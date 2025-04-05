// functions/api/test.js
export async function onRequestGet() {
  const data = { status: "ok", message: "Test function is working!" };
  // Ensure headers are set correctly for JSON
  const headers = {
    'Content-Type': 'application/json'
  };
  return new Response(JSON.stringify(data), { status: 200, headers: headers });
}