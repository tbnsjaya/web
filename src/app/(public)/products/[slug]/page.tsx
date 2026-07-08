import React from "react";
import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [{ slug: "detail" }];
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
