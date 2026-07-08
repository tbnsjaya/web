"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { CategoryService } from "@/services/categories";
import { CustomerService } from "@/services/customers";
import { SalesService } from "@/services/sales";
import { usePOSStore } from "@/stores";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  Loader2,
  DollarSign,
  Printer,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";
import type { Product, Category, Customer } from "@/types";

export default function PosPage() {
  const {
    items,
    addItem,
    removeItem,
    updateQty,
    customerId,
    customerName,
    setCustomer,
    discount,
    setDiscount,
    clearCart,
    subtotal: getSubtotal,
    total: getTotal
  } = usePOSStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Local states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-registration states
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);
  
  // Completed sale info for print/WA
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // SWR lists
  const { data: productsRes, mutate: mutateProducts, isLoading: isProductsLoading } = useSWR(
    "adminProducts",
    () => ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  const { data: categoriesRes } = useSWR("adminCategories", () =>
    CategoryService.getAll()
  );
  const categories = categoriesRes?.data?.items || [];

  const { data: customersRes, mutate: mutateCustomers } = useSWR("adminCustomers", () =>
    CustomerService.getAll()
  );
  const customers = customersRes?.data?.items || [];

  const subtotal = getSubtotal();
  const total = getTotal();

  // Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        if (items.length > 0) {
          setIsCheckoutOpen(true);
        } else {
          toast.error("Cart masih kosong!");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        clearCart();
        setIsCheckoutOpen(false);
        toast.info("Cart dibersihkan!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, clearCart]);

  // Catalog Filters
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }
    return result;
  }, [products, searchTerm, selectedCategory]);

  // Handle New Customer Registration on the fly
  const handleAutoRegisterCustomer = async () => {
    if (!newCustomerName) return;
    setIsAutoRegistering(true);
    try {
      const res = await CustomerService.create({
        name: newCustomerName,
        phone: "08123456789", // Default
        address: "Registrasi Kasir POS",
        type: "umum",
      });
      if (res.success && res.data) {
        toast.success(`Pelanggan ${newCustomerName} berhasil didaftarkan!`);
        mutateCustomers();
        setCustomer(res.data.id, res.data.name);
        setNewCustomerName("");
      } else {
        toast.error(res.message || "Gagal meregistrasi pelanggan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsAutoRegistering(false);
    }
  };

  // Checkout submit
  const handleCheckoutSubmit = async () => {
    if (paymentMethod === "cash" && cashReceived < total) {
      toast.error("Uang yang diterima kurang!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const invoiceNo = `INV-${new Date().getTime().toString().slice(-6)}`;
      const payload = {
        invoiceNo,
        customerId: customerId || undefined,
        subtotal,
        discount,
        total,
        paymentMethod,
        details: items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          price: i.price,
        })),
      };

      // OPTIMISTIC STOCK UPDATE: Update stock in local SWR cache immediately
      const originalProducts = productsRes;
      if (productsRes?.data) {
        const updatedItems = productsRes.data.items.map((p) => {
          const cartItem = items.find((i) => i.productId === p.id);
          if (cartItem && p.currentStock !== undefined) {
            return {
              ...p,
              currentStock: Math.max(0, p.currentStock - cartItem.qty),
            };
          }
          return p;
        });

        mutateProducts(
          {
            ...productsRes,
            data: { ...productsRes.data, items: updatedItems },
          },
          { revalidate: false }
        );
      }

      // Execute Sale
      const res = await SalesService.create(payload);
      if (res.success && res.data) {
        toast.success("Transaksi Penjualan Berhasil!");
        setCompletedSale({
          ...res.data,
          items: [...items],
          cashReceived,
          change: cashReceived - total,
        });
        clearCart();
        mutateProducts(); // Reload lists to sync
      } else {
        toast.error(res.message || "Gagal memproses transaksi");
        if (originalProducts) {
          mutateProducts(originalProducts); // Rollback
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp receipt helper
  const handleSendWhatsAppReceipt = () => {
    if (!completedSale) return;
    const phoneNum = "6282330449041";
    let msg = `*STRUK BELANJA - TB NS JAYA*\n`;
    msg += `No Invoice: ${completedSale.invoiceNo}\n`;
    msg += `Tanggal: ${new Date(completedSale.date || Date.now()).toLocaleDateString("id-ID")}\n`;
    msg += `----------------------------------------\n`;
    completedSale.items.forEach((item: any) => {
      msg += `${item.productName} (x${item.qty}) - Rp ${item.price.toLocaleString("id-ID")}\n`;
    });
    msg += `----------------------------------------\n`;
    msg += `Subtotal: Rp ${completedSale.subtotal.toLocaleString("id-ID")}\n`;
    msg += `Diskon: Rp ${completedSale.discount.toLocaleString("id-ID")}\n`;
    msg += `*TOTAL: Rp ${completedSale.total.toLocaleString("id-ID")}*\n`;
    if (completedSale.paymentMethod === "cash") {
      msg += `Tunai Diterima: Rp ${completedSale.cashReceived.toLocaleString("id-ID")}\n`;
      msg += `Kembalian: Rp ${completedSale.change.toLocaleString("id-ID")}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `Terima kasih telah berbelanja di TB NS Jaya!`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Print receipt helper
  const handlePrintReceipt = () => {
    if (!completedSale) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    let html = `
      <html>
        <head>
          <title>Struk Belanja</title>
          <style>
            body { font-family: monospace; font-size: 12px; max-width: 250px; margin: auto; padding: 20px; }
            h2 { text-align: center; margin: 0; }
            p { text-align: center; margin: 5px 0; }
            hr { border-top: 1px dashed #000; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <h2>TB NS JAYA</h2>
          <p>Jl. Raya Pasirian, Lumajang</p>
          <p>No Invoice: ${completedSale.invoiceNo}</p>
          <hr/>
    `;
    
    completedSale.items.forEach((item: any) => {
      html += `
        <div class="item">
          <span>${item.productName} (x${item.qty})</span>
          <span>Rp ${(item.price * item.qty).toLocaleString("id-ID")}</span>
        </div>
      `;
    });
    
    html += `
          <hr/>
          <div class="item">
            <span>Subtotal</span>
            <span>Rp ${completedSale.subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div class="item">
            <span>Diskon</span>
            <span>Rp ${completedSale.discount.toLocaleString("id-ID")}</span>
          </div>
          <div class="total">
            <span>TOTAL</span>
            <span>Rp ${completedSale.total.toLocaleString("id-ID")}</span>
          </div>
          <hr/>
          <p>Terima Kasih!</p>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* LEFT: Product Grid (Catalog) */}
      <div className="lg:col-span-7 flex flex-col h-full space-y-4">
        {/* Search & Category Filter */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Cari produk berdasarkan nama atau SKU... (F2)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] border border-[var(--border)] text-[var(--text-body)]"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--text-body)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin">
          {isProductsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const stock = p.currentStock || 0;
                const isOutOfStock = stock <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addItem(p)}
                    className={`bg-[var(--surface)] border rounded-[var(--radius-lg)] p-3 text-left flex flex-col justify-between h-36 hover:border-[var(--primary)] transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isOutOfStock ? "opacity-50 pointer-events-none border-[var(--border)]" : "border-[var(--border)]"
                    }`}
                  >
                    <div>
                      <p className="font-heading font-extrabold text-xs text-[var(--text-heading)] line-clamp-2">{p.name}</p>
                      <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{p.sku}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-[var(--border-muted)]">
                      <p className="font-heading font-black text-xs text-[var(--text-heading)]">
                        Rp {p.sellPrice.toLocaleString("id-ID")}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${isOutOfStock ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-600"}`}>
                        Stok: {stock}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-12 text-center">
              <p className="text-xs text-[var(--text-muted)]">Tidak ada produk yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout Panel */}
      <div className="lg:col-span-5 flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-sm overflow-hidden">
        <h3 className="font-heading font-bold text-sm text-[var(--text-heading)] mb-4 flex items-center space-x-1.5">
          <ShoppingCart className="w-4.5 h-4.5 text-[var(--primary)]" />
          <span>Cart Kasir</span>
        </h3>

        {/* Cart Item List */}
        <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs"
              >
                <div className="space-y-1 max-w-[200px]">
                  <p className="font-bold text-[var(--text-heading)] truncate">{item.productName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center space-x-3.5">
                  <div className="flex items-center space-x-1 border border-[var(--border)] rounded bg-white">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="p-1 hover:bg-[var(--color-slate-100)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold px-2 font-mono text-[var(--text-heading)]">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="p-1 hover:bg-[var(--color-slate-100)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">
              Cart masih kosong. Pilih produk di sebelah kiri atau ketik nama.
            </div>
          )}
        </div>

        {/* Customer Selector & Registration */}
        <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Pilih Pelanggan
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={customerId || ""}
                onChange={(e) => {
                  const opt = e.target.selectedOptions[0];
                  setCustomer(opt.value || null, opt.text !== "Pelanggan Umum" ? opt.text : null);
                }}
                className="flex-1 px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
              >
                <option value="">Pelanggan Umum</option>
                {customers.map((c: Customer) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Add Customer */}
          <div className="space-y-1.5 bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
            <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Daftarkan Pelanggan Baru
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Nama pelanggan baru..."
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-[var(--border)] rounded text-[11px] focus:outline-none focus:border-[var(--primary)] bg-white text-[var(--text-heading)] font-semibold"
              />
              <button
                type="button"
                onClick={handleAutoRegisterCustomer}
                disabled={isAutoRegistering || !newCustomerName}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-2 rounded flex items-center justify-center cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isAutoRegistering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Discount Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Nominal Diskon (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold font-mono"
            />
          </div>

          {/* Totals Summary */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-muted)] text-xs">
            <div className="flex justify-between text-[var(--text-muted)] font-semibold">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)] font-semibold">
              <span>Diskon:</span>
              <span>Rp {discount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[var(--text-heading)] pt-1.5 border-t border-[var(--border-muted)]">
              <span>TOTAL BELANJA:</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={items.length === 0}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Bayar Sekarang (F8)</span>
          </button>
        </div>
      </div>

      {/* MODAL: Checkout / Payment dialog */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
              <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">
                Proses Pembayaran Penjualan
              </h3>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedSale(null);
                }}
                className="p-1 rounded-lg hover:bg-[var(--color-slate-200)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!completedSale ? (
                <>
                  {/* Payment Method Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Metode Pembayaran
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="kasbon">Kasbon Pelanggan</option>
                    </select>
                  </div>

                  {/* Cash Received (if cash) */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                        Uang Tunai Diterima (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="Masukkan nominal uang..."
                        value={cashReceived || ""}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold font-mono"
                      />
                    </div>
                  )}

                  {/* Totals & Change */}
                  <div className="space-y-2 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Total Tagihan:</span>
                      <span className="font-mono">Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    {paymentMethod === "cash" && (
                      <div className="flex justify-between font-bold text-green-600 dark:text-green-400 pt-2 border-t border-[var(--border-muted)]">
                        <span>Kembalian:</span>
                        <span className="font-mono">
                          Rp {Math.max(0, cashReceived - total).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warning if Kasbon without customer name */}
                  {paymentMethod === "kasbon" && !customerId && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs leading-relaxed">
                      Peringatan: Untuk metode pembayaran Kasbon, Anda wajib memilih pelanggan terdaftar terlebih dahulu di panel Cart.
                    </div>
                  )}

                  {/* Confirm checkout */}
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmitting || (paymentMethod === "kasbon" && !customerId)}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Selesaikan Transaksi</span>
                  </button>
                </>
              ) : (
                /* Post-sale Actions (Print & WA Sharing) */
                <div className="space-y-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[var(--text-heading)]">Transaksi Berhasil Disimpan</h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Invoice: {completedSale.invoiceNo}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handlePrintReceipt}
                      className="p-4 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded-lg text-xs font-bold text-[var(--text-heading)] flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors"
                    >
                      <Printer className="w-6 h-6 text-[var(--primary)]" />
                      <span>Cetak Struk</span>
                    </button>
                    <button
                      onClick={handleSendWhatsAppReceipt}
                      className="p-4 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded-lg text-xs font-bold text-[var(--text-heading)] flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-6 h-6 text-green-500" />
                      <span>Kirim WhatsApp</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCompletedSale(null);
                    }}
                    className="w-full bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] font-semibold py-3 px-4 rounded-lg text-xs cursor-pointer mt-4"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
