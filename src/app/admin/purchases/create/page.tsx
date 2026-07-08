"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { SupplierService } from "@/services/suppliers";
import { ProductService } from "@/services/products";
import { PurchaseService } from "@/services/purchases";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product, Supplier } from "@/types";

const purchaseSchema = z.object({
  poNumber: z.string().min(3, "Nomor PO minimal 3 karakter"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  status: z.enum(["lunas", "hutang"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Produk wajib dipilih"),
        qty: z.number().min(1, "Qty minimal 1"),
        price: z.number().min(0, "Harga beli minimal 0"),
      })
    )
    .min(1, "Minimal harus ada 1 item pembelian"),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function CreatePurchasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Suppliers & Products
  const { data: suppliersRes } = useSWR("adminSuppliers", () =>
    SupplierService.getAll()
  );
  const suppliers = suppliersRes?.data?.items || [];

  const { data: productsRes } = useSWR("adminProducts", () =>
    ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  // Auto-generate PO number
  const initialPoNo = React.useMemo(() => {
    return `PO-${new Date().getTime().toString().slice(-6)}`;
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      poNumber: initialPoNo,
      supplierId: "",
      status: "lunas",
      items: [{ productId: "", qty: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  // Calculate dynamic subtotal
  const grandTotal = React.useMemo(() => {
    return watchItems.reduce((acc, curr) => acc + (curr.qty * curr.price || 0), 0);
  }, [watchItems]);

  const handleProductSelect = (index: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    if (selected) {
      setValue(`items.${index}.price`, selected.buyPrice, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        poNumber: values.poNumber,
        supplierId: values.supplierId,
        total: grandTotal,
        status: values.status,
        details: values.items,
      };

      const res = await PurchaseService.create(payload);
      if (res.success) {
        toast.success("PO Pembelian berhasil dicatat dan stok ditambahkan!");
        router.push("/admin/purchases");
      } else {
        toast.error(res.message || "Gagal menyimpan PO Pembelian");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/purchases"
          className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-body)]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Pencatatan Pembelian Baru (PO)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Buat Nota Pembelian untuk restock barang ke gudang.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 space-y-4 md:col-span-2">
            <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">Informasi Transaksi</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PO Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nomor PO / Surat Jalan
                </label>
                <input
                  type="text"
                  {...register("poNumber")}
                  className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold ${
                    errors.poNumber ? "border-red-500" : "border-[var(--border)]"
                  }`}
                />
                {errors.poNumber && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.poNumber.message}</p>
                )}
              </div>

              {/* Supplier Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Pilih Supplier / Distributor
                </label>
                <select
                  {...register("supplierId")}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                >
                  <option value="">Cari supplier...</option>
                  {suppliers.map((s: Supplier) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.supplierId.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Status Pembayaran PO
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
                >
                  <option value="lunas">Lunas (Stok Langsung Dibayar)</option>
                  <option value="hutang">Hutang (Bayar Nanti / Tempo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">Total Tagihan</h3>
              <p className="font-heading font-black text-2xl text-[var(--text-heading)]">
                Rp {grandTotal.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Akumulasi seluruh barang masuk yang diinput.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer disabled:opacity-50 mt-6 text-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan PO Pembelian</span>
            </button>
          </div>
        </div>

        {/* Purchase Items List Grid */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-xs text-[var(--text-heading)] uppercase tracking-wider">Rincian Barang Masuk</h3>
            <button
              type="button"
              onClick={() => append({ productId: "", qty: 1, price: 0 })}
              className="bg-[var(--background)] hover:bg-[var(--border-muted)] border border-[var(--border)] text-[var(--text-body)] text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item</span>
            </button>
          </div>

          {errors.items && (
            <p className="text-[var(--color-danger-text)] text-[10px]">{errors.items.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs animate-in slide-in-from-bottom-1 duration-150">
                {/* Product SELECT */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Pilih Barang</label>
                  <select
                    {...register(`items.${index}.productId` as const)}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full px-2.5 py-2 border border-[var(--border)] rounded bg-white text-xs focus:outline-none focus:border-[var(--primary)] text-[var(--text-heading)] font-semibold"
                  >
                    <option value="">Pilih Produk...</option>
                    {products.map((p: Product) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Harga Beli / Satuan (Rp)</label>
                  <input
                    type="number"
                    {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                    className="w-full px-2.5 py-2 border border-[var(--border)] rounded bg-white text-xs focus:outline-none focus:border-[var(--primary)] text-[var(--text-heading)] font-semibold font-mono"
                  />
                </div>

                {/* Qty */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Jumlah Qty</label>
                  <input
                    type="number"
                    {...register(`items.${index}.qty` as const, { valueAsNumber: true })}
                    className="w-full px-2.5 py-2 border border-[var(--border)] rounded bg-white text-xs focus:outline-none focus:border-[var(--primary)] text-[var(--text-heading)] font-semibold font-mono"
                  />
                </div>

                {/* Row Subtotal */}
                <div className="sm:col-span-1 text-center font-bold font-mono pb-2 text-[var(--text-heading)] text-[10px]">
                  Rp {((watchItems[index]?.qty || 0) * (watchItems[index]?.price || 0)).toLocaleString("id-ID")}
                </div>

                {/* Delete */}
                <div className="sm:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-500 hover:text-red-600 disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
