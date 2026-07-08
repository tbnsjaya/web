// API Route: Proxy for Google Apps Script
// Keeps the API URL hidden from client-side code

export async function GET() {
  const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal merespons dari server');
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Data fetch error:', error);
    return Response.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(request) {
  const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error('Data save error:', error);
    return Response.json({ error: 'Gagal menyimpan data', status: 'error' }, { status: 500 });
  }
}
