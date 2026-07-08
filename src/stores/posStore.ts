import { create } from "zustand";
import type { Product } from "@/types";

/**
 * Item di dalam cart POS
 */
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  unit: string;
  subtotal: number;
}

interface POSStore {
  // Cart
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discount: number; // Nilai diskon dalam rupiah
  note: string;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (amount: number) => void;
  setNote: (note: string) => void;
  clearCart: () => void;

  // Computed
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
}

/**
 * POS Store — State untuk transaksi kasir
 * Tidak di-persist (cart dikosongkan saat halaman refresh)
 */
export const usePOSStore = create<POSStore>()((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  discount: 0,
  note: "",

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            price: product.sellPrice,
            qty: 1,
            unit: product.unit,
            subtotal: product.sellPrice,
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateQty: (productId, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.productId !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId
            ? { ...i, qty, subtotal: qty * i.price }
            : i
        ),
      };
    }),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setDiscount: (amount) => set({ discount: amount }),
  setNote: (note) => set({ note }),
  clearCart: () =>
    set({ items: [], customerId: null, customerName: null, discount: 0, note: "" }),

  // Computed selectors
  subtotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),
  total: () => Math.max(0, get().subtotal() - get().discount),
  itemCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}));
