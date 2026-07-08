"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { ProductService } from "@/services/products";
import { ShoppingBag, ChevronRight, MessageSquare, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { data: productsRes, isLoading } = useSWR("publicProducts", () =>
    ProductService.getAll({ page: 1, perPage: 100 })
  );

  const getWaLink = (productName: string, price: number) => {
    const phoneNum = "6282330449041";
    const msg = `Halo TB NS Jaya, saya ingin memesan produk: *${productName}* seharga Rp ${price.toLocaleString("id-ID")}. Apakah stoknya ready?`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`;
  };

  if (isLoading) {
    return (
      <div className="p-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const product = productsRes?.data?.items?.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-[var(--text-disabled)] mx-auto" />
        <h2 className="font-heading text-lg font-bold text-[var(--text-heading)]">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Bahan bangunan yang Anda cari tidak tersedia di katalog kami.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const waLink = getWaLink(product.name, product.sellPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--primary)]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-[var(--primary)]">Produk</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-body)] font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Images */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex items-center justify-center min-h-[400px]">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              className="w-full max-h-[400px] object-contain rounded-lg"
              loading="eager"
            />
          ) : (
            <ShoppingBag className="w-24 h-24 text-[var(--text-disabled)]" />
          )}
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold text-[var(--primary)] bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10 inline-block">
              {product.categoryName || "Material Konstruksi"}
            </span>
            <h1 className="font-heading text-2xl md:text-3xl font-black text-[var(--text-heading)] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">SKU: {product.sku}</p>
          </div>

          <div className="border-y border-[var(--border)] py-4">
            <p className="text-xs text-[var(--text-muted)]">Harga Penawaran</p>
            <p className="font-heading font-black text-3xl text-[var(--text-heading)] mt-1">
              Rp {product.sellPrice.toLocaleString("id-ID")}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{product.unit}
              </span>
            </p>
          </div>

          {/* Verification Checkmarks */}
          <div className="space-y-3 bg-[var(--border-muted)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
              <span className="text-[var(--text-body)] font-semibold">Standardisasi Mutu SNI</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
              <span className="text-[var(--text-body)] font-semibold">Status Stok: Tersedia / Hubungi Gudang</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 px-6 rounded-lg text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/10 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Pesan via WhatsApp</span>
            </a>
            <Link
              href="/products"
              className="bg-[var(--color-slate-100)] hover:bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] dark:hover:bg-[var(--color-slate-700)] text-[var(--text-heading)] font-semibold py-4 px-6 rounded-lg text-sm text-center transition-colors cursor-pointer"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
