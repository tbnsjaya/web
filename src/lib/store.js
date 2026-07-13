'use client';

import { create } from 'zustand';
import { fetchData, saveData as saveDataApi, sendTelegram } from '@/lib/api';
import { calculateStock, formatCurrency } from '@/lib/utils';

const useStore = create((set, get) => ({
  // --- State ---
  items: [],
  categories: [],
  sales: [],
  purchases: [],
  customers: [],
  settings: { theme: 'light' },
  posCart: [],
  posCategoryFilter: 'all',
  posSearchQuery: '',
  isLoading: true,
  loadingText: 'Menghubungkan ke Database Cloud...',

  // --- Data Actions ---
  loadData: async () => {
    set({ isLoading: true, loadingText: 'Menghubungkan ke Database Cloud...' });
    try {
      const data = await fetchData();
      if (data.items || data.categories || data.sales || data.purchases || data.customers) {
        set({
          items: (data.items || []).map((i) => ({ ...i, unit: i.unit || 'Pcs', imageUrl: i.imageUrl || '' })),
          categories: data.categories || [],
          customers: data.customers || [],
          purchases: (data.purchases || []).map((p) => ({ ...p, paymentHistory: p.paymentHistory || [] })),
          sales: (data.sales || []).map((s) => {
            let normalizedItems = [];
            if (s.items) {
              try {
                normalizedItems = Array.isArray(s.items) ? s.items : JSON.parse(s.items);
              } catch (err) {
                normalizedItems = [];
              }
            } else if (s.itemId) {
              normalizedItems = [{
                itemId: s.itemId,
                quantity: s.quantity || 0,
                price: s.pricePerItem || 0
              }];
            }
            return {
              ...s,
              items: normalizedItems,
              isKasbon: s.isKasbon || false,
              customerDetails: s.customerDetails || null,
              dueDate: s.dueDate || null,
              isPaid: s.isPaid === undefined ? true : s.isPaid,
              paidAmount: s.paidAmount === undefined ? s.totalPrice : s.paidAmount,
              paymentHistory: s.paymentHistory || [],
            };
          }),
        });
        if (data.settings) set({ settings: data.settings });
      }
    } catch (error) {
      console.error(error);
    }
    // Ensure default categories
    const { categories } = get();
    if (categories.length === 0) {
      set({
        categories: [
          { id: 'cat-1', name: 'Semen & Pasir' },
          { id: 'cat-2', name: 'Besi & Baja' },
        ],
      });
    }
    set({ isLoading: false });
  },

  saveData: async () => {
    const { items, categories, sales, purchases, customers, settings } = get();
    try {
      await saveDataApi({ items, categories, sales, purchases, customers, settings });
    } catch (error) {
      console.error('Save failed:', error);
    }
  },

  syncData: async () => {
    await get().loadData();
  },

  // --- Theme & Settings ---
  toggleTheme: () => {
    const { settings } = get();
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    set({ settings: { ...settings, theme: newTheme } });
    get().saveData();
  },
  
  updateSettings: (newSettings) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
    get().saveData();
  },

  // --- Items ---
  addItem: (item) => {
    const { items } = get();
    set({ items: [...items, item] });
    get().saveData();
  },

  updateItem: (id, updates) => {
    const { items } = get();
    set({ items: items.map((i) => (i.id === id ? { ...i, ...updates } : i)) });
    get().saveData();
  },

  deleteItem: (id) => {
    const { items } = get();
    set({ items: items.filter((i) => i.id !== id) });
    get().saveData();
  },

  adjustStock: (id, adjustment) => {
    const { items, purchases, sales } = get();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const oldStock = calculateStock(id, items, purchases, sales);
    const updatedItems = items.map((i) =>
      i.id === id ? { ...i, initialStock: i.initialStock + adjustment } : i
    );
    set({ items: updatedItems });

    const newStock = oldStock + adjustment;
    if (newStock <= 10 && oldStock > 10) {
      sendTelegram(
        `⚠️ *Peringatan Stok Menipis (Hasil Penyesuaian)!*\n\nBarang: *${item.name}* (${item.code})\nSisa Stok: *${newStock} ${item.unit}*\n\n_Segera cek keadaan fisik barang._`
      );
    }
    get().saveData();
  },

  // --- Categories ---
  addCategory: (category) => {
    const { categories } = get();
    set({ categories: [...categories, category] });
    get().saveData();
  },

  updateCategory: (id, name) => {
    const { categories } = get();
    set({ categories: categories.map((c) => (c.id === id ? { ...c, name } : c)) });
    get().saveData();
  },

  deleteCategory: (id) => {
    const { categories } = get();
    set({ categories: categories.filter((c) => c.id !== id) });
    get().saveData();
  },

  // --- POS Cart ---
  addToCart: (itemId) => {
    const { items, purchases, sales, posCart } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item) return 'not_found';
    const stock = calculateStock(itemId, items, purchases, sales);
    if (stock <= 0) return 'no_stock';

    const existing = posCart.find((c) => c.itemId === itemId);
    if (existing) {
      if (existing.qty + 1 > stock) return 'exceeds_stock';
      set({
        posCart: posCart.map((c) => (c.itemId === itemId ? { ...c, qty: c.qty + 1 } : c)),
      });
    } else {
      set({ posCart: [...posCart, { itemId, qty: 1, price: item.salePrice }] });
    }
    return 'success';
  },

  removeFromCart: (itemId) => {
    const { posCart } = get();
    set({ posCart: posCart.filter((c) => c.itemId !== itemId) });
  },

  changeCartQty: (itemId, delta) => {
    const { posCart, items, purchases, sales } = get();
    const cartItem = posCart.find((c) => c.itemId === itemId);
    if (!cartItem) return;
    const newQty = cartItem.qty + delta;
    if (newQty <= 0) {
      get().removeFromCart(itemId);
      return 'removed';
    }
    const stock = calculateStock(itemId, items, purchases, sales);
    if (newQty > stock) return 'exceeds_stock';
    set({
      posCart: posCart.map((c) => (c.itemId === itemId ? { ...c, qty: newQty } : c)),
    });
    return 'success';
  },

  setCartQty: (itemId, value) => {
    const qty = parseFloat(value);
    if (isNaN(qty) || qty <= 0) {
      get().removeFromCart(itemId);
      return 'removed';
    }
    const { posCart, items, purchases, sales } = get();
    const stock = calculateStock(itemId, items, purchases, sales);
    if (qty > stock) return 'exceeds_stock';
    set({
      posCart: posCart.map((c) => (c.itemId === itemId ? { ...c, qty } : c)),
    });
    return 'success';
  },

  clearCart: () => set({ posCart: [] }),

  // --- Checkout ---
  checkout: async ({ customer, isKasbon, dueDate, dpAmount, sendWa, paymentMethod }) => {
    const { posCart, items, purchases, sales } = get();
    const totalPrice = posCart.reduce((sum, c) => sum + c.qty * c.price, 0);
    const dateIso = new Date().toISOString();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    let lowStockAlerts = [];

    const newSale = {
      id: invoiceNumber,
      items: posCart.map((cartItem) => {
        const oldStock = calculateStock(cartItem.itemId, items, purchases, sales);
        const newStock = oldStock - cartItem.qty;
        if (newStock <= 10 && oldStock > 10) {
          const itemDef = items.find((i) => i.id === cartItem.itemId);
          if (itemDef) lowStockAlerts.push(`- *${itemDef.name}* (Sisa: ${newStock} ${itemDef.unit})`);
        }
        return {
          itemId: cartItem.itemId,
          quantity: cartItem.qty,
          price: cartItem.price,
        };
      }),
      totalPrice,
      date: dateIso,
      isKasbon,
      isPaid: !isKasbon || (dpAmount || 0) >= totalPrice,
      paidAmount: isKasbon ? dpAmount || 0 : totalPrice,
      paymentHistory: (dpAmount > 0 && isKasbon) ? [{ date: dateIso, amount: dpAmount, method: paymentMethod || 'tunai' }] : [],
      customerDetails: customer
        ? { name: customer.name, phone: customer.phone, address: customer.address }
        : null,
      dueDate: dueDate || null,
      paymentMethod: paymentMethod || 'tunai',
    };

    set((state) => ({
      sales: [...state.sales, newSale],
      posCart: [],
    }));

    // Handle customer
    if (customer) {
      const { customers } = get();
      const existing = customers.find((c) => c.id === customer.id);
      if (existing) {
        set({
          customers: customers.map((c) =>
            c.id === customer.id
              ? { ...c, name: customer.name, phone: customer.phone, address: customer.address, totalTransactions: (c.totalTransactions || 0) + 1 }
              : c
          ),
        });
      } else {
        set({
          customers: [
            ...customers,
            { ...customer, totalTransactions: 1, joinDate: new Date().toISOString() },
          ],
        });
      }
    }

    await get().saveData();

    // Low stock alerts
    if (lowStockAlerts.length > 0) {
      sendTelegram(
        `⚠️ *Peringatan Stok Menipis (Kasir)!*\n\nBarang berikut menyentuh batas minimum:\n${lowStockAlerts.join('\n')}\n\n_Segera cek keadaan fisik barang._`
      );
    }

    return { invoiceNumber, totalPrice };
  },

  // --- Purchases ---
  addPurchase: (purchase) => {
    set((state) => ({ purchases: [...state.purchases, purchase] }));
    get().saveData();
  },

  deletePurchase: (id) => {
    set((state) => ({ purchases: state.purchases.filter((p) => p.id !== id) }));
    get().saveData();
  },

  deleteSale: (id) => {
    set((state) => ({ sales: state.sales.filter((s) => s.id !== id) }));
    get().saveData();
  },

  // --- Debt Payments ---
  payDebt: (id, amount) => {
    set((state) => ({
      purchases: state.purchases.map((p) => {
        if (p.id !== id) return p;
        const newPaid = p.paidAmount + amount;
        return {
          ...p,
          paidAmount: newPaid,
          isPaid: newPaid >= p.totalCost,
          paymentHistory: [...(p.paymentHistory || []), { date: new Date().toISOString(), amount }],
        };
      }),
    }));
    get().saveData();
  },

  payKasbon: (id, amount) => {
    set((state) => ({
      sales: state.sales.map((s) => {
        if (s.id !== id) return s;
        const newPaid = s.paidAmount + amount;
        return {
          ...s,
          paidAmount: newPaid,
          isPaid: newPaid >= s.totalPrice,
          paymentHistory: [...(s.paymentHistory || []), { date: new Date().toISOString(), amount }],
        };
      }),
    }));
    get().saveData();
  },

  // --- Customers ---
  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().saveData();
  },

  // --- POS Filters ---
  setPosSearch: (query) => set({ posSearchQuery: query }),
  setPosCategoryFilter: (filter) => set({ posCategoryFilter: filter }),

  // --- Stock Reminder ---
  checkStockReminder: async () => {
    const { items, purchases, sales } = get();
    if (!items || items.length === 0) return;

    const lowStockItems = items
      .map((item) => ({ ...item, currentStock: calculateStock(item.id, items, purchases, sales) }))
      .filter((item) => item.currentStock <= 10);

    if (lowStockItems.length === 0) return;

    const lastReminder = typeof window !== 'undefined' ? localStorage.getItem('nsJaya_lastStockReminder') : null;
    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    let shouldSend = false;
    if (!lastReminder) {
      shouldSend = true;
    } else {
      const lastDate = new Date(lastReminder);
      if (isNaN(lastDate.getTime()) || now.getTime() - lastDate.getTime() >= threeDaysInMs) {
        shouldSend = true;
      }
    }

    if (shouldSend && typeof window !== 'undefined') {
      localStorage.setItem('nsJaya_lastStockReminder', now.toISOString());
      let pesan = `⚠️ *PENGINGAT RUTIN STOK MENIPIS* ⚠️\n\nBerikut adalah daftar barang yang perlu segera dipesan ulang:\n\n`;
      lowStockItems.forEach((item, index) => {
        pesan += `${index + 1}. *${item.name}* (${item.code})\n   Sisa Stok: *${item.currentStock} ${item.unit}*\n`;
      });
      pesan += `\n_Pesan ini dikirim otomatis setiap 3 hari jika ada stok <= 10._`;
      await sendTelegram(pesan);
    }
  },
}));

export default useStore;
