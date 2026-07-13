'use client';

import { useState, useMemo } from 'react';
import useStore from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DebtsPage() {
  const { purchases, items, payDebt } = useStore();
  const [sortBy, setSortBy] = useState('due-date-asc');
  const [payModal, setPayModal] = useState(null);

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID');
  };

  const in7Days = new Date(now); in7Days.setDate(in7Days.getDate() + 7);

  const unpaidDebts = useMemo(() => {
    let list = purchases.filter((p) => p.isDebt && !p.isPaid).map((p) => ({ ...p, remaining: p.totalCost - (p.paidAmount || 0) }));
    list.sort((a, b) => {
      if (sortBy === 'due-date-asc') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'amount-desc') return b.remaining - a.remaining;
      return new Date(b.date) - new Date(a.date);
    });
    return list;
  }, [purchases, sortBy]);

  const totalDebt = unpaidDebts.reduce((sum, d) => sum + d.remaining, 0);
  const due7Days = unpaidDebts.filter((d) => d.dueDate && new Date(d.dueDate) <= in7Days).reduce((sum, d) => sum + d.remaining, 0);

  const handlePay = (e) => {
    e.preventDefault();
    const amt = parseFloat(e.target.amount.value);
    if (amt > payModal.remaining || amt <= 0) return toast.error('Jumlah tidak valid.');
    payDebt(payModal.id, amt);
    setPayModal(null);
    toast.success('Pembayaran dicatat.');
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stagger-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Utang ke Pemasok</p>
          <p className="text-2xl md:text-3xl font-extrabold text-red-500">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="stagger-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jatuh Tempo ≤ 7 Hari</p>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-500">{formatCurrency(due7Days)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="p-4 flex justify-end border-b border-slate-100 dark:border-slate-800">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
            <option value="due-date-asc">Jatuh Tempo Terdekat</option>
            <option value="amount-desc">Tagihan Terbesar</option>
            <option value="date-desc">Transaksi Terbaru</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Jatuh Tempo</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Pemasok</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Barang</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Sisa Tagihan</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th></tr></thead>
            <tbody>
              {unpaidDebts.length > 0 ? unpaidDebts.map((d) => {
                const item = items.find((i) => i.id === d.itemId);
                const isOverdue = d.dueDate && new Date(d.dueDate) < now;
                return (
                  <tr key={d.id} className={`border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isOverdue ? 'row-warning' : ''}`}>
                    <td className={`py-3 px-4 font-bold text-sm ${isOverdue ? 'text-red-500' : ''}`}>{formatDate(d.dueDate)}</td>
                    <td className="py-3 px-4 text-sm">{d.supplier}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{item?.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-500">{formatCurrency(d.remaining)}</td>
                    <td className="py-3 px-4 text-center"><button onClick={() => setPayModal(d)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 shadow-sm transition-all btn-press">Bayar</button></td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada utang yang belum lunas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPayModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Bayar Utang</h3>
              <button onClick={() => setPayModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-slate-400">Pemasok</p><p className="font-bold">{payModal.supplier}</p></div>
                <div className="text-right"><p className="text-xs text-slate-400">Sisa Tagihan</p><p className="font-bold text-red-500 text-lg">{formatCurrency(payModal.remaining)}</p></div>
              </div>
              {payModal.paymentHistory?.length > 0 && (
                <div className="mb-4"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 dark:border-slate-800"><th className="py-2 text-left text-xs text-slate-400">Riwayat Bayar</th><th className="py-2 text-right text-xs text-slate-400">Jumlah</th></tr></thead><tbody>{payModal.paymentHistory.map((h, i) => (<tr key={i} className="border-b border-slate-100/60 dark:border-slate-800/60"><td className="py-2">{new Date(h.date).toLocaleDateString()}</td><td className="py-2 text-right">{formatCurrency(h.amount)}</td></tr>))}</tbody></table></div>
              )}
              <form onSubmit={handlePay}>
                <label className="text-sm font-semibold mb-1 block">Bayar Berapa?</label>
                <input name="amount" type="number" max={payModal.remaining} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm mb-4 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
                <div className="flex justify-end"><button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all btn-press">Catat Pembayaran</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
