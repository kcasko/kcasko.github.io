// functions/api/test.js
export async function onRequestGet() {
  const data = { message: "Hello from test function!" };
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}