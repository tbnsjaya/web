// API Route: Proxy for Telegram Bot API
// Keeps BOT_TOKEN hidden from client-side code

export async function POST(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return Response.json({ error: 'Telegram not configured' }, { status: 500 });
  }

  try {
    const { message } = await request.json();
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return Response.json({ status: 'success' });
  } catch (error) {
    console.error('Telegram send error:', error);
    return Response.json({ error: 'Gagal mengirim notifikasi' }, { status: 500 });
  }
}
