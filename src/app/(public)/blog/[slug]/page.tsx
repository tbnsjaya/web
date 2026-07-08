import React from "react";
import BlogDetailClient from "./BlogDetailClient";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [{ slug: "detail" }];
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
