"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { CategoryService } from "@/services/categories";
import { DataTable, Column } from "@/components/ui/DataTable";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Loader2, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { AuthGuard } from "@/components/providers";
import { useAuth } from "@/hooks/useAuth";
import type { Product, Category } from "@/types";

const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan -"),
  sku: z.string().min(3, "SKU minimal 3 karakter"),
  barcode: z.string().optional(),
  buyPrice: z.number().min(0, "Harga beli minimal 0"),
  sellPrice: z.number().min(0, "Harga jual minimal 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  isActive: z.boolean(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsAdminPage() {
  const { checkPermission } = useAuth();
  const canCreate = checkPermission("products.create");
  const canUpdate = checkPermission("products.update");
  const canDelete = checkPermission("products.delete");

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Fetch products
  const { data: productsRes, mutate, isLoading } = useSWR("adminProducts", () =>
    ProductService.getAll()
  );
  const products = productsRes?.data?.items || [];

  // Fetch categories
  const { data: categoriesRes } = useSWR("adminCategories", () =>
    CategoryService.getAll()
  );
  const categories = categoriesRes?.data?.items || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      barcode: "",
      buyPrice: 0,
      sellPrice: 0,
      unit: "pcs",
      categoryId: "",
      isActive: true,
      imageUrl: "",
    },
  });

  const watchName = watch("name");
  const watchImageUrl = watch("imageUrl");

  // Auto-slug generator
  React.useEffect(() => {
    if (!editingId && watchName) {
      const generated = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [watchName, setValue, editingId]);

  const handleOpenCreate = () => {
    reset({
      name: "",
      slug: "",
      sku: "",
      barcode: "",
      buyPrice: 0,
      sellPrice: 0,
      unit: "pcs",
      categoryId: "",
      isActive: true,
      imageUrl: "",
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    reset({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      barcode: prod.barcode || "",
      buyPrice: prod.buyPrice,
      sellPrice: prod.sellPrice,
      unit: prod.unit,
      categoryId: prod.categoryId,
      isActive: prod.isActive,
      imageUrl: prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : "",
    });
    setEditingId(prod.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const res = await ProductService.delete(id);
      if (res.success) {
        toast.success("Produk berhasil dihapus!");
        mutate();
      } else {
        toast.error(res.message || "Gagal menghapus produk");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await ProductService.update(editingId, {
          ...values,
          images: values.imageUrl ? [{ id: "", productId: editingId, imageUrl: values.imageUrl, isPrimary: true }] : [],
        });
      } else {
        res = await ProductService.create(values);
      }

      if (res.success) {
        toast.success(editingId ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
        mutate();
        setIsOpen(false);
      } else {
        toast.error(res.message || "Gagal menyimpan produk");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Import handler
  const handleImport = async (rows: any[]) => {
    let successCount = 0;
    for (const row of rows) {
      if (!row.name || !row.sku || !row.sellPrice || !row.categoryId || !row.unit) continue;
      try {
        const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await ProductService.create({
          name: row.name,
          slug,
          sku: row.sku,
          barcode: row.barcode || "",
          buyPrice: Number(row.buyPrice || 0),
          sellPrice: Number(row.sellPrice),
          unit: row.unit,
          categoryId: row.categoryId,
          isActive: row.isActive !== "false",
          imageUrl: row.imageUrl || "",
        });
        successCount++;
      } catch {
        // Continue
      }
    }
    toast.success(`${successCount} produk berhasil diimport!`);
    mutate();
  };

  const columns: Column<Product>[] = [
    {
      header: "Gambar",
      accessor: (row) => (
        <div className="w-10 h-10 rounded border border-[var(--border)] overflow-hidden bg-[var(--background)] flex items-center justify-center">
          {row.images && row.images.length > 0 ? (
            <img src={row.images[0].imageUrl} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-4 h-4 text-[var(--text-disabled)]" />
          )}
        </div>
      ),
    },
    { header: "Nama Produk", accessor: "name", sortKey: "name" },
    { header: "SKU", accessor: "sku", sortKey: "sku" },
    { header: "Kategori", accessor: "categoryName" },
    {
      header: "Harga Beli",
      accessor: (row) => `Rp ${row.buyPrice.toLocaleString("id-ID")}`,
      sortKey: "buyPrice",
    },
    {
      header: "Harga Jual",
      accessor: (row) => `Rp ${row.sellPrice.toLocaleString("id-ID")}`,
      sortKey: "sellPrice",
    },
    { header: "Satuan", accessor: "unit" },
    {
      header: "Aksi",
      accessor: (row) => (
        <div className="flex space-x-2">
          {canUpdate && (
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 border border-[var(--border)] hover:bg-red-500/10 rounded text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AuthGuard permission="products.read">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
              Manajemen Produk
            </h1>
            <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
              Daftar persediaan produk material dan barang bangunan.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>

        {/* DataTable */}
        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            searchFields={["name", "sku", "barcode", "unit", "categoryName"]}
            searchPlaceholder="Cari produk..."
            onImport={canCreate ? handleImport : undefined}
            exportFilename="produk-material"
          />
        )}

        {/* Create/Edit Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">
                    {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--color-slate-200)] text-[var(--text-muted)] hover:text-[var(--text-body)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      placeholder="Semen Gresik 50kg"
                      {...register("name")}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.name ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Slug URL
                    </label>
                    <input
                      type="text"
                      placeholder="semen-gresik-50kg"
                      {...register("slug")}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.slug ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.slug && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.slug.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Kategori
                    </label>
                    <select
                      {...register("categoryId")}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] border-[var(--border)] font-semibold"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat: Category) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      SKU
                    </label>
                    <input
                      type="text"
                      placeholder="SMN-GRS-50"
                      {...register("sku")}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.sku ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.sku && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.sku.message}</p>
                    )}
                  </div>

                  {/* Buy Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Harga Beli (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="55000"
                      {...register("buyPrice", { valueAsNumber: true })}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.buyPrice ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.buyPrice && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.buyPrice.message}</p>
                    )}
                  </div>

                  {/* Sell Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Harga Jual (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="65000"
                      {...register("sellPrice", { valueAsNumber: true })}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.sellPrice ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.sellPrice && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.sellPrice.message}</p>
                    )}
                  </div>

                  {/* Unit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Satuan
                    </label>
                    <input
                      type="text"
                      placeholder="sak / pcs / kg"
                      {...register("unit")}
                      className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                        errors.unit ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.unit && (
                      <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.unit.message}</p>
                    )}
                  </div>

                  {/* Barcode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Barcode (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="8991234567890"
                      {...register("barcode")}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] border-[var(--border)]"
                    />
                  </div>

                  {/* Image Picker */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                      Gambar Produk
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded border border-[var(--border)] bg-[var(--background)] overflow-hidden flex items-center justify-center flex-shrink-0">
                        {watchImageUrl ? (
                          <img src={watchImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[var(--text-disabled)]" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] text-xs font-bold py-2 px-3 rounded border border-[var(--border)] cursor-pointer"
                      >
                        Pilih Gambar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2.5 pt-4 border-t border-[var(--border)] mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] text-[var(--text-heading)] font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Media Picker Modal */}
        <MediaPicker
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(url) => setValue("imageUrl", url, { shouldValidate: true })}
        />
      </div>
    </AuthGuard>
  );
}
