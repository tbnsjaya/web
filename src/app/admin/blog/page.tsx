"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { BlogService } from "@/services/blog";
import type { Blog, BlogCategory } from "@/types";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function BlogCmsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch blogs
  const { data: blogsRes, isLoading, mutate } = useSWR("cmsBlogs", () =>
    BlogService.getAll({ page: 1, perPage: 100 })
  );
  const blogs = blogsRes?.data?.items || [];

  // Fetch blog categories
  const { data: categoriesRes } = useSWR("cmsBlogCategories", () =>
    BlogService.getCategories()
  );
  const categories = categoriesRes?.data?.items || [];

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await BlogService.delete(id);
      if (res.success) {
        toast.success("Artikel berhasil dihapus!");
        mutate();
      } else {
        toast.error(res.message || "Gagal menghapus artikel");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  // Filter local
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (searchTerm) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((b) => b.categoryId === selectedCategory);
    }

    if (selectedStatus && selectedStatus !== "all") {
      result = result.filter((b) => b.status === selectedStatus);
    }

    return result;
  }, [blogs, searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--text-heading)]">
            Manajemen Blog (CMS)
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Tulis, sunting, dan kelola artikel inspirasi/panduan konstruksi Anda.
          </p>
        </div>
        <Link
          href="/admin/blog/create"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari artikel berdasarkan judul atau slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)]"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat: BlogCategory) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          >
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan (Publish)</option>
            <option value="draft">Draf (Draft)</option>
          </select>
        </div>
      </div>

      {/* Blogs list table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--border-muted)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-16">Cover</th>
                  <th className="p-4">Judul Artikel</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Tanggal Buat</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-body)] font-medium">
                {filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--border-muted)]/50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded bg-[var(--background)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-[var(--text-disabled)]" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-[var(--text-heading)] line-clamp-1">{post.title}</p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">/{post.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded text-[10px]">
                        {post.categoryName || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-muted)] font-mono">
                      {new Date(post.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-4">
                      {post.status === "published" ? (
                        <span className="bg-green-500/10 text-green-600 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1 w-fit font-bold uppercase text-[9px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1 w-fit font-bold uppercase text-[9px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        title="Preview Artikel"
                        className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] text-[var(--text-muted)] hover:text-[var(--text-body)] rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        title="Edit Artikel"
                        className="p-2 border border-[var(--border)] hover:bg-[var(--color-slate-100)] text-[var(--text-muted)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        title="Hapus Artikel"
                        className="p-2 border border-[var(--border)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-4">
            <FileText className="w-12 h-12 text-[var(--text-disabled)] mx-auto" />
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-heading)]">Belum ada artikel</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Tulis inspirasi atau panduan konstruksi pertama Anda sekarang.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
