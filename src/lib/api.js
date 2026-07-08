// API client for TB NS Jaya
// All requests go through Next.js API routes to keep credentials secure

/**
 * Fetch all data from Google Apps Script via proxy
 */
export async function fetchData() {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Gagal memuat data dari server');
  return response.json();
}

/**
 * Save all data to Google Apps Script via proxy
 */
export async function saveData(state) {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message || 'Gagal menyimpan data');
  return result;
}

/**
 * Send Telegram notification via proxy
 */
export async function sendTelegram(message) {
  try {
    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
}
