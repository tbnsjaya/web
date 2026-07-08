"use client";

import React, { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { BlogService } from "@/services/blog";
import { FileText, Calendar, User, ChevronRight, ArrowLeft } from "lucide-react";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = use(params);

  // Fetch blogs list and find the matched slug
  const { data: blogsRes, isLoading } = useSWR("publicBlogs", () =>
    BlogService.getAll({ page: 1, perPage: 100, publishedOnly: true })
  );
  const post = blogsRes?.data?.items?.find((b) => b.slug === slug);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-[var(--border)] w-1/4 rounded" />
        <div className="h-10 bg-[var(--border)] w-3/4 rounded" />
        <div className="h-6 bg-[var(--border)] w-1/3 rounded" />
        <div className="h-[300px] bg-[var(--border)] rounded-xl w-full" />
        <div className="space-y-2">
          <div className="h-4 bg-[var(--border)] w-full rounded" />
          <div className="h-4 bg-[var(--border)] w-5/6 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <FileText className="w-12 h-12 text-[var(--text-disabled)] mx-auto" />
        <h2 className="font-heading text-lg font-bold text-[var(--text-heading)]">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Artikel yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center space-x-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Breadcrumbs / Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center space-x-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Artikel</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase font-extrabold text-[var(--primary)] bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10 inline-block">
          {post.categoryName || "Inspirasi & Tips"}
        </span>
        <h1 className="font-heading text-2xl sm:text-4xl font-black text-[var(--text-heading)] leading-tight tracking-tight">
          {post.title}
        </h1>
        
        {/* Meta */}
        <div className="flex items-center text-xs text-[var(--text-muted)] space-x-6 border-b border-[var(--border)] pb-4">
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.createdAt).toLocaleDateString("id-ID")}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <User className="w-4 h-4" />
            <span>{post.authorName || "Admin"}</span>
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="h-[350px] md:h-[450px] w-full rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Article Content */}
      <article
        className="prose prose-slate max-w-none text-sm leading-relaxed text-[var(--text-body)] space-y-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const res = await BlogService.getAll();
    const items = res?.data?.items || [];
    return items.map((post) => ({
      slug: post.slug,
    }));
  } catch (e) {
    return [];
  }
}
