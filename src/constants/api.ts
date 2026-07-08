/**
 * constants/api.ts
 * Konfigurasi URL dan konstanta untuk API layer
 */

export const GAS_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tbnsjaya.com";

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/**
 * SWR Cache Keys — digunakan sebagai key untuk useSWR hooks
 * Menggunakan format: /action/params untuk konsistensi
 */
export const SWR_KEYS = {
  // Dashboard
  DASHBOARD_STATS: "/dashboard/stats",

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_SLUG: (slug: string) => `/products/${slug}`,

  // Categories
  CATEGORIES: "/categories",

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,

  // Suppliers
  SUPPLIERS: "/suppliers",
  SUPPLIER_BY_ID: (id: string) => `/suppliers/${id}`,

  // Sales
  SALES: "/sales",
  SALE_BY_ID: (id: string) => `/sales/${id}`,

  // Purchases
  PURCHASES: "/purchases",

  // Inventory
  STOCK_MOVEMENTS: "/stock-movements",
  STOCK_BY_PRODUCT: (productId: string) => `/stock/${productId}`,

  // Kasbon
  KASBON: "/kasbon",
  KASBON_BY_ID: (id: string) => `/kasbon/${id}`,

  // Supplier Debt
  SUPPLIER_DEBT: "/supplier-debt",

  // Blog
  BLOGS: "/blogs",
  BLOG_BY_SLUG: (slug: string) => `/blog/${slug}`,
  BLOG_CATEGORIES: "/blog-categories",

  // Media
  MEDIA: "/media",

  // Promotions
  PROMOTIONS: "/promotions",

  // Banners
  BANNERS: "/banners",

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Settings
  WEBSITE_SETTINGS: "/settings/website",
  ANALYTICS_SETTINGS: "/settings/analytics",
} as const;
