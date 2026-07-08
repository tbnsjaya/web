/**
 * Standar Response Format dari Google Apps Script
 * Semua endpoint GAS wajib mengembalikan format ini
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

/**
 * Format error response
 */
export interface ApiError {
  success: false;
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Standar payload yang dikirim ke GAS
 */
export interface GasPayload<T = unknown> {
  action: string;
  token: string;
  payload: T;
}

/**
 * Standar struktur pagination response dari GAS
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Payload untuk request yang menggunakan pagination
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
