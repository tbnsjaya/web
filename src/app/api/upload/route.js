export const maxDuration = 60; // Allow more time for upload to Google Drive

export async function POST(request) {
  const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 });
  }

  try {
    const body = await request.json(); // Harus mengandung { action: 'uploadImage', base64Data, fileName, mimeType }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Gagal mengunggah gambar', status: 'error' }, { status: 500 });
  }
}
