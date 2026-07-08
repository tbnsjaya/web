import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Custom error class untuk API errors
 * Membawa status code dan structured error response dari GAS
 */
export class AppApiError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(message: string, code: number, data?: unknown) {
    super(message);
    this.name = "AppApiError";
    this.code = code;
    this.data = data;
  }
}

/**
 * Menangani response error dari API
 * @param response - Fetch Response object
 */
async function handleResponseError(response: Response): Promise<never> {
  let errorBody: ApiError | undefined;
  try {
    errorBody = await response.json();
  } catch {
    // Response bukan JSON
  }

  throw new AppApiError(
    errorBody?.message ?? `HTTP Error: ${response.status}`,
    errorBody?.code ?? response.status,
    errorBody?.data
  );
}

/**
 * Core fetch wrapper yang menangani:
 * - Authentication header (JWT)
 * - Standard response format dari GAS
 * - Error handling terpusat
 *
 * @param url - Endpoint URL atau path
 * @param options - Request options
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tbnsjaya_token")
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  const json: ApiResponse<T> = await response.json();

  // GAS mungkin return HTTP 200 tapi success: false
  if (!json.success) {
    throw new AppApiError(json.message ?? "Request gagal", json.code ?? 400, json.data);
  }

  return json;
}
