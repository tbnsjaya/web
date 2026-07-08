"use client";

import React, { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { BlogService } from "@/services/blog";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { toast } from "sonner";
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";

// Form Schema
const blogSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categoriesRes } = useSWR("cmsBlogCategories", () =>
    BlogService.getCategories()
  );
  const categories = categoriesRes?.data?.items || [];

  // Fetch blogs list and find the matched blog post
  const { data: blogsRes, isLoading: isBlogLoading, mutate } = useSWR("cmsBlogs", () =>
    BlogService.getAll({ page: 1, perPage: 100 })
  );
  const post = blogsRes?.data?.items?.find((b) => b.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      categoryId: "",
      coverImage: "",
      status: "draft",
    },
  });

  // Pre-fill form when post data is loaded
  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        categoryId: post.categoryId,
        coverImage: post.coverImage || "",
        status: post.status,
      });
    }
  }, [post, reset]);

  const watchCoverImage = watch("coverImage");

  const onSubmit = async (values: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await BlogService.update(id, {
        title: values.title,
        slug: values.slug,
        content: values.content,
        categoryId: values.categoryId,
        coverImage: values.coverImage,
        status: values.status,
      });

      if (res.success) {
        toast.success("Artikel berhasil diperbarui!");
        mutate();
        router.push("/admin/blog");
      } else {
        toast.error(res.message || "Gagal memperbarui artikel");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlogLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center p-12 space-y-4">
        <h3 className="font-heading text-lg font-bold text-[var(--text-heading)]">Artikel Tidak Ditemukan</h3>
        <button
          onClick={() => router.push("/admin/blog")}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2 px-4 rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.push("/admin/blog")}
          className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] text-[var(--text-muted)] hover:text-[var(--text-body)] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Sunting Artikel
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            Ubah spesifikasi, cover gambar, atau status artikel Anda di bawah.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Judul Artikel
            </label>
            <input
              type="text"
              placeholder="Masukkan judul artikel..."
              {...register("title")}
              className={`w-full px-4 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 bg-[var(--background)] ${
                errors.title
                  ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] text-[var(--color-danger-text)]"
                  : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] text-[var(--text-heading)]"
              }`}
            />
            {errors.title && (
              <p className="text-[var(--color-danger-text)] text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Slug URL
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">
                /blog/
              </span>
              <input
                type="text"
                placeholder="slug-artikel"
                {...register("slug")}
                className={`w-full pl-16 pr-4 py-3 rounded-[var(--radius-md)] border font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 bg-[var(--background)] ${
                  errors.slug
                    ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] text-[var(--color-danger-text)]"
                    : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] text-[var(--text-heading)]"
                }`}
              />
            </div>
            {errors.slug && (
              <p className="text-[var(--color-danger-text)] text-xs mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Category & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                Kategori Artikel
              </label>
              <select
                {...register("categoryId")}
                className={`w-full px-3 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] ${
                  errors.categoryId ? "border-[var(--color-danger)]" : "border-[var(--border)]"
                }`}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[var(--color-danger-text)] text-xs mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                Status Publikasi
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] border-[var(--border)]"
              >
                <option value="draft">Draf (Draft - Simpan Internal)</option>
                <option value="published">Diterbitkan (Publish - Tampil Publik)</option>
              </select>
            </div>
          </div>

          {/* Cover Image Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
              Gambar Sampul / Thumbnail
            </label>
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                {watchCoverImage ? (
                  <img src={watchCoverImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[var(--text-disabled)]" />
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-heading)] text-xs font-bold py-2.5 px-4 rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
                >
                  Pilih dari Media Library
                </button>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Format gambar disarankan landscape (16:9) dengan max size 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider block">
                Isi Artikel (Mendukung HTML)
              </label>
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded">
                HTML Mode
              </span>
            </div>
            <textarea
              rows={12}
              placeholder="Tulis artikel lengkap Anda di sini..."
              {...register("content")}
              className={`w-full px-4 py-3 rounded-[var(--radius-md)] border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 bg-[var(--background)] text-[var(--text-heading)] leading-relaxed font-mono ${
                errors.content
                  ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                  : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
              }`}
            />
            {errors.content && (
              <p className="text-[var(--color-danger-text)] text-xs mt-1">{errors.content.message}</p>
            )}
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-heading)] font-semibold py-3 px-6 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 px-6 rounded-lg text-xs shadow-lg shadow-orange-500/10 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setValue("coverImage", url, { shouldValidate: true })}
      />
    </div>
  );
}
