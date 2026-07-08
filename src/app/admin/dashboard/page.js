'use client';

import useStore from '@/lib/store';
import { formatCurrency, calculateStock } from '@/lib/utils';
import { TrendingUp, DollarSign, AlertTriangle, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function KpiCard({ label, value, icon: Icon, color, delay }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/25',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/25',
    slate: 'from-slate-600 to-slate-800 shadow-slate-500/25',
  };
  return (
    <div className={`stagger-${delay} bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { items, sales, purchases, categories } = useStore();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalGrossProfit = sales.reduce((sum, sale) => {
    const item = items.find((i) => i.id === sale.itemId);
    return item ? sum + (sale.pricePerItem - item.hpp) * sale.quantity : sum;
  }, 0);
  const totalTransactions = sales.length;
  const totalPiutang = sales
    .filter((s) => s.isKasbon && !s.isPaid)
    .reduce((sum, s) => sum + (s.totalPrice - s.paidAmount), 0);

  // Best selling items
  const itemSalesQty = {};
  const itemSalesProfit = {};
  sales.forEach((sale) => {
    const item = items.find((i) => i.id === sale.itemId);
    if (!item) return;
    itemSalesQty[item.name] = (itemSalesQty[item.name] || 0) + sale.quantity;
    itemSalesProfit[item.name] = (itemSalesProfit[item.name] || 0) + (sale.pricePerItem - item.hpp) * sale.quantity;
  });

  const bestSelling = Object.entries(itemSalesQty)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, qty]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value: qty }));

  const mostProfitable = Object.entries(itemSalesProfit)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, profit]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value: profit }));

  const lowStockItems = items
    .map((item) => ({
      ...item,
      currentStock: calculateStock(item.id, items, purchases, sales),
      categoryName: categories.find((c) => c.id === item.categoryId)?.name || '-',
    }))
    .filter((item) => item.currentStock <= 10)
    .sort((a, b) => a.currentStock - b.currentStock);

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        <KpiCard label="Total Omzet Penjualan" value={formatCurrency(totalRevenue)} icon={DollarSign} color="indigo" delay={1} />
        <KpiCard label="Total Laba Kotor" value={formatCurrency(totalGrossProfit)} icon={TrendingUp} color="emerald" delay={2} />
        <KpiCard label="Total Piutang Kasbon" value={formatCurrency(totalPiutang)} icon={AlertTriangle} color="amber" delay={3} />
        <KpiCard label="Total Transaksi" value={totalTransactions.toString()} icon={ShoppingCart} color="slate" delay={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Barang Paling Laris
          </h3>
          <div className="h-[300px]">
            {bestSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSelling} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v) => [`${v} unit`, 'Terjual']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data penjualan</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paling Menguntungkan
          </h3>
          <div className="h-[300px]">
            {mostProfitable.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostProfitable} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Laba']} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Belum ada data penjualan</div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Stok Menipis (≤ 10)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Barang</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Sisa Stok</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold">{item.name}</td>
                    <td className="py-3 px-4 text-slate-500">{item.categoryName}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-500">
                      {item.currentStock} {item.unit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Stok aman. Semua barang tersedia cukup.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
