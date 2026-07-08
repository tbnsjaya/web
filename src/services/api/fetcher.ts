import { apiFetch } from "./client";

/**
 * Global SWR fetcher
 * Digunakan sebagai default fetcher di SWRConfig
 *
 * SWR memanggil fetcher(key) dengan key sebagai URL
 * Kita unwrap .data dari ApiResponse agar SWR mendapatkan data mentah
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const response = await apiFetch<T>(url);
  return response.data as T;
}
