"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { CategoryService } from "@/services/categories";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Loader2, Layers } from "lucide-react";
import type { Category } from "@/types";

const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan -"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesAdminPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesRes, mutate, isLoading } = useSWR("adminCategories", () =>
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
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const watchName = watch("name");

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
    reset({ name: "", slug: "", description: "" });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
    });
    setEditingId(cat.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await CategoryService.delete(id);
      if (res.success) {
        toast.success("Kategori berhasil dihapus!");
        mutate();
      } else {
        toast.error(res.message || "Gagal menghapus kategori");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await CategoryService.update(editingId, values);
      } else {
        res = await CategoryService.create(values);
      }

      if (res.success) {
        toast.success(editingId ? "Kategori berhasil diperbarui!" : "Kategori berhasil ditambahkan!");
        mutate();
        setIsOpen(false);
      } else {
        toast.error(res.message || "Gagal menyimpan kategori");
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
      if (!row.name) continue;
      try {
        const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await CategoryService.create({
          name: row.name,
          slug,
          description: row.description || "",
        });
        successCount++;
      } catch {
        // Continue
      }
    }
    toast.success(`${successCount} kategori berhasil diimport!`);
    mutate();
  };

  const columns: Column<Category>[] = [
    { header: "Nama Kategori", accessor: "name", sortKey: "name" },
    { header: "Slug URL", accessor: "slug", sortKey: "slug" },
    { header: "Deskripsi", accessor: "description" },
    {
      header: "Aksi",
      accessor: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 border border-[var(--border)] hover:bg-[var(--color-slate-100)] rounded text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 border border-[var(--border)] hover:bg-red-500/10 rounded text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Kategori Produk
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Daftar kategori produk material bangunan.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <DataTable
          data={categories}
          columns={columns}
          searchFields={["name", "slug", "description"]}
          searchPlaceholder="Cari kategori..."
          onImport={handleImport}
          exportFilename="kategori-produk"
        />
      )}

      {/* Create/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--border-muted)]">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-heading text-sm font-bold text-[var(--text-heading)]">
                  {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
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
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Semen"
                  {...register("name")}
                  className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                    errors.name ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                  }`}
                />
                {errors.name && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Slug URL
                </label>
                <input
                  type="text"
                  placeholder="semen"
                  {...register("slug")}
                  className={`w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                    errors.slug ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                  }`}
                />
                {errors.slug && (
                  <p className="text-[var(--color-danger-text)] text-[10px] mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat kategori..."
                  {...register("description")}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] border-[var(--border)]"
                />
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
    </div>
  );
}
