/**
 * constants/routes.ts
 * Route constants untuk seluruh halaman aplikasi
 */

export const ROUTES = {
  // ---- PUBLIC WEBSITE ----
  HOME: "/",
  ABOUT: "/about",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  PRODUCT_CATEGORY: (slug: string) => `/products/category/${slug}`,
  BLOG: "/blog",
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  CONTACT: "/contact",

  // ---- AUTH ----
  LOGIN: "/admin/login",

  // ---- DASHBOARD (Admin / Owner / Kasir) ----
  DASHBOARD: "/admin/dashboard",
  POS: "/admin/pos",

  // Master Data
  PRODUCTS_ADMIN: "/admin/products",
  PRODUCT_CREATE: "/admin/products/create",
  PRODUCT_EDIT: (id: string) => `/admin/products/${id}/edit`,
  CATEGORIES_ADMIN: "/admin/categories",

  // Inventory
  INVENTORY: "/admin/inventory",
  STOCK_MOVEMENTS: "/admin/inventory/movements",
  STOCK_OPNAME: "/admin/inventory/opname",

  // Purchases
  PURCHASES: "/admin/purchases",
  PURCHASE_CREATE: "/admin/purchases/create",
  PURCHASE_DETAIL: (id: string) => `/admin/purchases/${id}`,

  // CRM / Customers
  CUSTOMERS: "/admin/customers",
  CUSTOMER_DETAIL: (id: string) => `/admin/customers/${id}`,

  // Kasbon
  KASBON: "/admin/kasbon",
  KASBON_DETAIL: (id: string) => `/admin/kasbon/${id}`,

  // Suppliers
  SUPPLIERS: "/admin/suppliers",
  SUPPLIER_DEBT: "/admin/suppliers/debt",

  // Blog CMS
  BLOG_CMS: "/admin/blog",
  BLOG_CREATE: "/admin/blog/create",
  BLOG_EDIT: (id: string) => `/admin/blog/edit?id=${id}`,

  // Media
  MEDIA: "/admin/media",

  // Promotions
  PROMOTIONS: "/admin/promotions",
  BANNERS: "/admin/banners",

  // Reports
  REPORTS: "/admin/reports",
  REPORT_SALES: "/admin/reports/sales",
  REPORT_INVENTORY: "/admin/reports/inventory",
  REPORT_FINANCIAL: "/admin/reports/financial",

  // Analytics
  ANALYTICS: "/admin/analytics",

  // Settings
  SETTINGS: "/admin/settings",
  SETTINGS_WEBSITE: "/admin/settings/website",
  SETTINGS_USERS: "/admin/settings/users",
  SETTINGS_ANALYTICS: "/admin/settings/analytics",
} as const;
