"use client";

import { useAuth } from "./useAuth";

export function usePermission() {
  const { checkPermission, hasRole, user } = useAuth();

  return {
    canReadProducts: checkPermission("products.read") || checkPermission("products.*"),
    canCreateProducts: checkPermission("products.create") || checkPermission("products.*"),
    canUpdateProducts: checkPermission("products.update") || checkPermission("products.*"),
    canDeleteProducts: checkPermission("products.delete") || checkPermission("products.*"),
    
    canReadSales: checkPermission("sales.read"),
    canCreateSales: checkPermission("sales.create"),
    canVoidSales: checkPermission("sales.void"),
    
    canReadPurchases: checkPermission("purchases.read") || checkPermission("purchases.*"),
    canCreatePurchases: checkPermission("purchases.create") || checkPermission("purchases.*"),

    canReadKasbon: checkPermission("kasbon.read") || checkPermission("kasbon.*"),
    canCreateKasbon: checkPermission("kasbon.create") || checkPermission("kasbon.*"),

    canReadDebt: checkPermission("debt.read") || checkPermission("debt.*"),
    canCreateDebt: checkPermission("debt.create") || checkPermission("debt.*"),

    canManageSettings: checkPermission("settings.write"),
    
    isOwner: user?.roleName === "owner",
    isAdmin: user?.roleName === "admin",
    isKasir: user?.roleName === "kasir",
    
    hasRole,
    checkPermission,
  };
}
