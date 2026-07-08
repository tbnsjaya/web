"use client";

import React, { useState, useTransition, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ProductService } from "@/services/products";
import { CategoryService } from "@/services/categories";
import type { Product, Category } from "@/types";
import { ShoppingBag, Search, SlidersHorizontal, MessageSquare, ArrowUpDown } from "lucide-react";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc">("name");

  // Fetch all categories for filter
  const { data: categoriesRes } = useSWR("publicCategories", () =>
    CategoryService.getAll()
  );
  const categories = categoriesRes?.data?.items || [];

  // Fetch products
  const { data: productsRes, isLoading } = useSWR("publicProducts", () =>
    ProductService.getAll({ page: 1, perPage: 100 })
  );
  const products = productsRes?.data?.items || [];

  // Client side filtering & sorting to keep interface fast
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price_asc") {
      result.sort((a, b) => a.sellPrice - b.sellPrice);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.sellPrice - a.sellPrice);
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // WhatsApp Order Link Helper
  const getWaLink = (productName: string, price: number) => {
    const phoneNum = "6282330449041";
    const msg = `Halo TB NS Jaya, saya ingin menanyakan ketersediaan produk: *${productName}* seharga Rp ${price.toLocaleString("id-ID")}. Apakah bisa dikirim hari ini?`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-extrabold text-[var(--text-heading)]">
          Katalog Material &amp; Bahan Bangunan
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Temukan semen, besi beton, keramik, cat, pipa PVC, dan kebutuhan teknik proyek Anda di sini.
        </p>
      </div>

      {/* Filter / Search Bar Panel */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)]"
          />
        </div>

        {/* Category Select */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--text-heading)] font-semibold"
          >
            <option value="name">Urut Abjad (A-Z)</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((prod: Product) => (
            <div
              key={prod.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 group relative"
            >
              {/* Product Card Click Link */}
              <Link href={`/products/${prod.slug}`} className="flex-1 flex flex-col">
                <div className="bg-[var(--background)] h-48 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {prod.images && prod.images.length > 0 ? (
                    <img
                      src={prod.images[0].imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-[var(--text-disabled)]" />
                  )}
                </div>
                
                <div className="mt-4 space-y-2 flex-grow">
                  <span className="text-[10px] uppercase font-bold text-[var(--primary)] bg-orange-500/5 px-2 py-0.5 rounded">
                    {prod.categoryName || "Material"}
                  </span>
                  <h3 className="font-heading text-sm font-bold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {prod.name}
                  </h3>
                  <p className="font-heading font-black text-sm text-[var(--text-heading)]">
                    Rp {prod.sellPrice.toLocaleString("id-ID")}
                    <span className="text-[10px] font-normal text-[var(--text-muted)]">
                      /{prod.unit}
                    </span>
                  </p>
                </div>
              </Link>

              {/* Purchase Button */}
              <a
                href={getWaLink(prod.name, prod.sellPrice)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 shadow transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Beli via WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-[var(--text-disabled)] mx-auto mb-4" />
          <h3 className="font-heading text-base font-bold text-[var(--text-heading)]">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Cobalah mengubah pencarian Anda atau memilih kategori yang berbeda.
          </p>
        </div>
      )}
    </div>
  );
}
