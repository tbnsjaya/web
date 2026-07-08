/**
 * utils/format.ts
 * Formatting helpers untuk currency, phone, date, dll.
 */

/**
 * Format angka menjadi format rupiah Indonesia
 * @example formatCurrency(55000) => "Rp 55.000"
 */
export function formatCurrency(
  amount: number,
  options?: { compact?: boolean }
): string {
  if (options?.compact && amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (options?.compact && amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format nomor telepon Indonesia
 * @example formatPhone("081234567890") => "0812-3456-7890"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{3})/, "$1-$2-$3");
  }
  if (cleaned.length === 12) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return phone;
}

/**
 * Format tanggal ISO string menjadi format Indonesia
 * @example formatDate("2024-01-15") => "15 Januari 2024"
 */
export function formatDate(
  dateString: string | Date,
  format: "full" | "short" | "relative" = "full"
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return "-";

  if (format === "relative") {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
  }

  if (format === "short") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format tanggal dengan jam
 * @example formatDateTime("2024-01-15T10:30:00") => "15 Jan 2024, 10:30"
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Format angka biasa dengan pemisah ribuan
 * @example formatNumber(1500) => "1.500"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Memotong teks panjang
 * @example truncate("Hello World", 5) => "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
