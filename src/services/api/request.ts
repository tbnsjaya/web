import { apiFetch } from "./client";
import type { GasPayload, ApiResponse } from "@/types/api";
import { GAS_API_URL } from "@/constants/api";

/**
 * Helper untuk melakukan request ke Google Apps Script.
 *
 * GAS menggunakan satu endpoint (doPost) dengan action-based routing.
 * Semua request dikirim sebagai POST dengan body JSON:
 * { action: string, token: string, payload: object }
 *
 * @param action - Nama action di GAS Router (e.g. "getProducts")
 * @param payload - Data yang dikirim ke GAS
 */
export async function gasRequest<TResponse = unknown, TPayload = unknown>(
  action: string,
  payload?: TPayload
): Promise<ApiResponse<TResponse>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tbnsjaya_token")
      : null;

  const body: GasPayload<TPayload> = {
    action,
    token: token ?? "",
    payload: payload ?? ({} as TPayload),
  };

  return apiFetch<TResponse>(GAS_API_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * REST-like abstraction wrappers for GAS action-based API
 */
export const api = {
  /**
   * General request wrapper
   */
  request: <TResponse = unknown, TPayload = unknown>(
    action: string,
    payload?: TPayload
  ) => gasRequest<TResponse, TPayload>(action, payload),

  /**
   * GET mapping -> action: get{Resource}
   * @example api.get("Products", { page: 1 }) -> action: getProducts
   */
  get: <TResponse = unknown, TParams = unknown>(
    resource: string,
    params?: TParams
  ) => {
    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const actionName = capitalized.startsWith("get") ? capitalized : `get${capitalized}`;
    return gasRequest<TResponse, TParams>(actionName, params);
  },

  /**
   * POST mapping -> action: create{Resource}
   * @example api.post("Product", { name: "Bata" }) -> action: createProduct
   */
  post: <TResponse = unknown, TPayload = unknown>(
    resource: string,
    payload?: TPayload
  ) => {
    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const actionName = capitalized.startsWith("create") ? capitalized : `create${capitalized}`;
    return gasRequest<TResponse, TPayload>(actionName, payload);
  },

  /**
   * PUT mapping -> action: update{Resource}
   * @example api.put("Product", { id: "123", name: "Bata Edit" }) -> action: updateProduct
   */
  put: <TResponse = unknown, TPayload = unknown>(
    resource: string,
    payload?: TPayload
  ) => {
    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const actionName = capitalized.startsWith("update") ? capitalized : `update${capitalized}`;
    return gasRequest<TResponse, TPayload>(actionName, payload);
  },

  /**
   * DELETE mapping -> action: delete{Resource}
   * @example api.delete("Product", { id: "123" }) -> action: deleteProduct
   */
  delete: <TResponse = unknown, TPayload = unknown>(
    resource: string,
    payload?: TPayload
  ) => {
    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const actionName = capitalized.startsWith("delete") ? capitalized : `delete${capitalized}`;
    return gasRequest<TResponse, TPayload>(actionName, payload);
  },

  /**
   * UPLOAD mapping -> action: createMedia
   */
  upload: <TResponse = unknown>(
    fileName: string,
    base64Data: string,
    type: string
  ) => {
    return gasRequest<TResponse, { fileName: string; url: string; type: string }>(
      "createMedia",
      { fileName, url: base64Data, type }
    );
  }
};
