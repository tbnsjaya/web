// Utility functions for TB NS Jaya

/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, (match) => {
    const escape = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return escape[match];
  });
}

/**
 * Calculate current stock for an item based on initial stock + purchases - sales
 */
export function calculateStock(itemId, items, purchases, sales) {
  const item = items.find((i) => i.id === itemId);
  if (!item) return 0;
  const bought = purchases.filter((p) => p.itemId === itemId).reduce((s, p) => s + p.quantity, 0);
  let sold = 0;
  sales.forEach((s) => {
    if (s.itemId === itemId) {
      sold += s.quantity || 0;
    } else if (Array.isArray(s.items)) {
      const match = s.items.find((si) => si.itemId === itemId);
      if (match) sold += match.quantity || 0;
    }
  });
  return item.initialStock + bought - sold;
}

/**
 * Format phone number for WhatsApp API (convert 08xx to 628xx)
 */
export function formatWAPhone(phone) {
  let cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
  return cleaned;
}

/**
 * Generate receipt text for WhatsApp
 */
export function generateReceiptText(invoiceNo, cart, items, total, isKasbon, dp, customer) {
  let txt = `*TB NS JAYA*\n`;
  txt += `Nota: ${invoiceNo}\n`;
  txt += `Tanggal: ${new Date().toLocaleString('id-ID')}\n`;
  if (customer) txt += `Pelanggan: ${customer.name}\n`;
  txt += `--------------------------------\n`;
  cart.forEach((c) => {
    const item = items.find((i) => i.id === c.itemId);
    if (!item) return;
    txt += `${c.qty} ${item.unit} x ${item.name}\n@ ${formatCurrency(c.price)} = ${formatCurrency(c.qty * c.price)}\n`;
  });
  txt += `--------------------------------\n`;
  txt += `*Total Tagihan: ${formatCurrency(total)}*\n`;
  if (isKasbon) {
    txt += `Status: KASBON / UTANG\nDP: ${formatCurrency(dp)}\nSisa Tagihan: *${formatCurrency(total - dp)}*\n`;
  } else {
    txt += `Status: LUNAS (Cash)\n`;
  }
  txt += `--------------------------------\n`;
  txt += `Terima kasih telah berbelanja di TB NS Jaya!\n_Semoga material yang dibeli membawa berkah._`;
  return txt;
}

/**
 * Capitalize first letter
 */
export function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Merge classnames utility (simple version)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
