import { AppApiError } from "./client";
import { toast } from "sonner";

/**
 * Menangani error dari API secara terpusat dengan Sonner toast.
 *
 * @param error - Error yang ditangkap (bisa AppApiError atau Error biasa)
 * @param fallbackMessage - Pesan default jika error tidak dikenali
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "Terjadi kesalahan. Silakan coba lagi."
): void {
  if (error instanceof AppApiError) {
    // Handle specific error codes
    switch (error.code) {
      case 401:
        toast.error("Sesi Anda telah habis. Silakan login kembali.");
        // Bisa ditambahkan redirect ke login di sini
        break;
      case 403:
        toast.error("Anda tidak memiliki izin untuk aksi ini.");
        break;
      case 404:
        toast.error("Data tidak ditemukan.");
        break;
      case 429:
        toast.error("Terlalu banyak request. Silakan tunggu sebentar.");
        break;
      default:
        toast.error(error.message || fallbackMessage);
    }
  } else if (error instanceof TypeError && error.message.includes("fetch")) {
    toast.error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
  } else if (error instanceof Error) {
    toast.error(error.message || fallbackMessage);
  } else {
    toast.error(fallbackMessage);
  }
}

/**
 * Mengembalikan pesan error sebagai string (tanpa toast)
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan."
): string {
  if (error instanceof AppApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
