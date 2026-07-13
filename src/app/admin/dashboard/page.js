'use client';

import { useState, useMemo } from 'react';
import useStore from '@/lib/store';
import { formatCurrency, calculateStock } from '@/lib/utils';
import { TrendingUp, DollarSign, AlertTriangle, ShoppingCart, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

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
  const [timeFilter, setTimeFilter] = useState('mingguan');

  const lineChartData = useMemo(() => {
    const now = new Date();
    const result = [];
    
    if (timeFilter === 'mingguan') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        result.push({
          dateStr: d.toDateString(),
          name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          omzet: 0,
          keuntungan: 0
        });
      }
    } else if (timeFilter === 'bulanan') {
      for (let i = 3; i >= 0; i--) {
        result.push({
          weekOffset: i, 
          name: `Minggu ke-${4-i}`,
          omzet: 0,
          keuntungan: 0
        });
      }
    } else if (timeFilter === 'tahunan') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        result.push({
          monthIndex: i,
          name: d.toLocaleDateString('id-ID', { month: 'short' }),
          omzet: 0,
          keuntungan: 0
        });
      }
    }

    sales.forEach(sale => {
      if (!sale.date) return;
      const saleDate = new Date(sale.date);
      const item = items.find(i => i.id === sale.itemId);
      const omzet = sale.totalPrice || 0;
      const profit = item ? (sale.pricePerItem - item.hpp) * sale.quantity : 0;

      if (timeFilter === 'mingguan') {
        const diffDays = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const bucket = result.find(r => r.dateStr === saleDate.toDateString());
          if (bucket) {
            bucket.omzet += omzet;
            bucket.keuntungan += profit;
          }
        }
      } else if (timeFilter === 'bulanan') {
        const diffDays = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const weekOffset = Math.floor(diffDays / 7);
          const bucket = result.find(r => r.weekOffset === weekOffset);
          if (bucket) {
            bucket.omzet += omzet;
            bucket.keuntungan += profit;
          }
        }
      } else if (timeFilter === 'tahunan') {
        if (saleDate.getFullYear() === now.getFullYear()) {
          const bucket = result.find(r => r.monthIndex === saleDate.getMonth());
          if (bucket) {
            bucket.omzet += omzet;
            bucket.keuntungan += profit;
          }
        }
      }
    });

    // reverse for chronological order
    if(timeFilter === 'bulanan') result.reverse();

    return result;
  }, [sales, items, timeFilter]);

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

      {/* Omzet & Profit Line Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Grafik Omzet & Keuntungan
          </h3>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="mingguan">7 Hari Terakhir</option>
            <option value="bulanan">4 Minggu Terakhir</option>
            <option value="tahunan">Tahun Ini</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'omzet' ? 'Omzet' : 'Keuntungan']}
                  labelStyle={{ color: '#0f172a' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="omzet" name="Omzet" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="keuntungan" name="Keuntungan" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400">Belum ada data penjualan</div>
          )}
        </div>
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
