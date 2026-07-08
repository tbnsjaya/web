"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { StockService } from "@/services/inventory";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";

const opnameSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  type: z.enum(["IN", "OUT", "ADJ"]),
  qty: z.number().min(1, "Jumlah minimal 1"),
  note: z.string().min(5, "Keterangan minimal 5 karakter"),
});

type OpnameFormValues = z.infer<typeof opnameSchema>;

export default function StockOpnamePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products
  const { data: productsRes } = useSWR("adminProducts", () =>
    ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OpnameFormValues>({
    resolver: zodResolver(opnameSchema),
    defaultValues: { productId: "", type: "ADJ", qty: 1, note: "" },
  });

  const watchProductId = watch("productId");
  const selectedProduct = products.find((p) => p.id === watchProductId);

  const onSubmit = async (values: OpnameFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await StockService.adjust(values);
      if (res.success) {
        toast.success("Penyesuaian stok berhasil disimpan!");
        router.push("/admin/inventory");
      } else {
        toast.error(res.message || "Gagal menyimpan penyesuaian stok");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/inventory"
          className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-body)] animate-in fade-in duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Pencatatan Penyesuaian Stok (Opname)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Sesuaikan stok fisik barang di gudang dengan sistem secara manual.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Pilih Barang / Material
            </label>
            <select
              {...register("productId")}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value="">Cari produk...</option>
              {products.map((p: Product) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku} | Stok: {p.currentStock || 0} {p.unit})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.productId.message}</p>
            )}
          </div>

          {/* Opname Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Tipe Penyesuaian
            </label>
            <select
              {...register("type")}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
            >
              <option value="ADJ">Absolute Adjustment (Set Setara Qty Fisik)</option>
              <option value="IN">Stock In (Tambahkan Qty Masuk)</option>
              <option value="OUT">Stock Out (Kurangkan Qty Keluar)</option>
            </select>
          </div>

          {/* Qty */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Jumlah Qty Penyesuaian
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="10"
                {...register("qty", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold font-mono"
              />
              {selectedProduct && (
                <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--background)] px-3 py-2.5 rounded-lg border border-[var(--border)]">
                  {selectedProduct.unit}
                </span>
              )}
            </div>
            {errors.qty && (
              <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.qty.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Keterangan Alasan Opname
            </label>
            <textarea
              rows={3}
              placeholder="Sebutkan detail alasan (Contoh: Barang pecah di gudang / Selisih opname akhir bulan)..."
              {...register("note")}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)]"
            />
            {errors.note && (
              <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.note.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2.5 pt-4 border-t border-[var(--border)] mt-6">
            <Link
              href="/admin/inventory"
              className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] font-semibold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center space-x-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Penyesuaian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
