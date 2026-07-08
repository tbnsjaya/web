import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export untuk GitHub Pages
  output: "export",

  // Base path sesuai nama repo GitHub (ubah sesuai repo name)
  // basePath: "/tbnsjaya",

  // Trailing slash agar GitHub Pages tidak redirect
  trailingSlash: true,

  // Matikan server-side image optimization (tidak support di static export)
  images: {
    unoptimized: true,
  },

  // Matikan x-powered-by header
  poweredByHeader: false,

  // Strict mode untuk development
  reactStrictMode: true,
};

export default nextConfig;
