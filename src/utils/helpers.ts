/**
 * utils/helpers.ts
 * Fungsi helper umum
 */

/**
 * Generate UUID v4 sederhana (tidak memerlukan library eksternal)
 * Digunakan untuk ID sementara di client sebelum disimpan ke server
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback untuk browser lama
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate slug dari string
 * @example generateSlug("Semen Padang 50kg") => "semen-padang-50kg"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Generate nomor invoice otomatis
 * @example generateInvoiceNo() => "INV-20240115-00001"
 */
export function generateInvoiceNo(prefix = "INV", counter = 1): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(counter).padStart(5, "0");
  return `${prefix}-${dateStr}-${seq}`;
}

/**
 * Generate nomor PO otomatis
 * @example generatePONumber() => "PO-20240115-00001"
 */
export function generatePONumber(counter = 1): string {
  return generateInvoiceNo("PO", counter);
}

/**
 * Membuat WhatsApp URL dengan pesan template order
 * @example buildWaUrl("081234567890", "Halo, saya mau pesan Semen 50kg")
 */
export function buildWaUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0")
    ? `62${cleaned.slice(1)}`
    : cleaned;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Deep clone object (tanpa reference)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function untuk search input
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Menghitung diskon
 * @param price - Harga asli
 * @param discount - Nilai diskon
 * @param type - "percentage" | "fixed"
 */
export function calculateDiscount(
  price: number,
  discount: number,
  type: "percentage" | "fixed"
): number {
  if (type === "percentage") {
    return Math.round(price * (discount / 100));
  }
  return Math.min(discount, price);
}

/**
 * Mengecek apakah string adalah URL valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Menghitung Margin Keuntungan (%)
 * Margin = ((Harga Jual - Harga Beli) / Harga Jual) * 100
 */
export function calculateMargin(buyPrice: number, sellPrice: number): number {
  if (sellPrice <= 0) return 0;
  return parseFloat((((sellPrice - buyPrice) / sellPrice) * 100).toFixed(2));
}

/**
 * Menghitung Markup Harga (%)
 * Markup = ((Harga Jual - Harga Beli) / Harga Beli) * 100
 */
export function calculateMarkup(buyPrice: number, sellPrice: number): number {
  if (buyPrice <= 0) return 0;
  return parseFloat((((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2));
}

/**
 * Menghitung stok akhir secara kumulatif dari transaksi log
 */
export function calculateStock(initialStock: number, movements: Array<{ type: "IN" | "OUT" | "ADJ"; qty: number }>): number {
  return movements.reduce((acc, mv) => {
    if (mv.type === "IN") return acc + mv.qty;
    if (mv.type === "OUT") return acc - mv.qty;
    if (mv.type === "ADJ") return mv.qty;
    return acc;
  }, initialStock);
}

