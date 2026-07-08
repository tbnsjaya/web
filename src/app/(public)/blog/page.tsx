"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { BlogService } from "@/services/blog";
import type { Blog, BlogCategory } from "@/types";
import { FileText, Search, Calendar, User, ChevronRight } from "lucide-react";

export default function BlogListingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch blog categories
  const { data: categoriesRes } = useSWR("publicBlogCategories", () =>
    BlogService.getCategories()
  );
  const categories = categoriesRes?.data?.items || [];

  // Fetch blogs
  const { data: blogsRes, isLoading } = useSWR("publicBlogs", () =>
    BlogService.getAll({ page: 1, perPage: 100, publishedOnly: true })
  );
  const blogs = blogsRes?.data?.items || [];

  // Filter local
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (searchTerm) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((b) => b.categoryId === selectedCategory);
    }

    return result;
  }, [blogs, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-extrabold text-[var(--text-heading)]">
          Blog &amp; Inspirasi Konstruksi
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Kumpulan tips renovasi rumah, panduan material, dan kabar terbaru dari industri teknik sipil.
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari artikel inspirasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)]"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4">
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
      </div>

      {/* Blog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-80 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="bg-[var(--border)] h-44 rounded-lg w-full" />
              <div className="space-y-2 mt-4">
                <div className="bg-[var(--border)] h-4 w-3/4 rounded" />
                <div className="bg-[var(--border)] h-4 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBlogs.map((post: Blog) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col hover:shadow-lg group transition-all"
            >
              <div className="h-48 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-[var(--text-disabled)]" />
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-[10px] text-[var(--text-muted)] space-x-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.createdAt).toLocaleDateString("id-ID")}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.authorName || "Admin"}</span>
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-extrabold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>
                <div className="text-[10px] font-bold text-[var(--primary)] flex items-center space-x-1 pt-2">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-[var(--text-disabled)] mx-auto mb-4" />
          <h3 className="font-heading text-base font-bold text-[var(--text-heading)]">Artikel Tidak Ditemukan</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Belum ada artikel yang cocok dengan pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
}
