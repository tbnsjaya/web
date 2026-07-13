'use client';

import { useState, useMemo } from 'react';
import useStore from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function KasbonPage() {
  const { sales, items, payKasbon } = useStore();
  const [sortBy, setSortBy] = useState('due-date-asc');
  const [payModal, setPayModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const in7Days = new Date(now); in7Days.setDate(in7Days.getDate() + 7);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID');
  };

  const unpaidKasbons = useMemo(() => {
    let list = sales.filter((s) => s.isKasbon && !s.isPaid).map((s) => ({ ...s, remaining: s.totalPrice - s.paidAmount }));
    list.sort((a, b) => {
      if (sortBy === 'due-date-asc') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'amount-desc') return b.remaining - a.remaining;
      return new Date(b.date) - new Date(a.date);
    });
    return list;
  }, [sales, sortBy]);

  const totalKasbon = unpaidKasbons.reduce((sum, k) => sum + k.remaining, 0);
  const due7Days = unpaidKasbons.filter((k) => k.dueDate && new Date(k.dueDate) <= in7Days).reduce((sum, k) => sum + k.remaining, 0);

  const handlePay = (e) => {
    e.preventDefault();
    const amt = parseFloat(e.target.amount.value);
    if (amt > payModal.remaining || amt <= 0) return toast.error('Jumlah tidak valid.');
    payKasbon(payModal.id, amt);
    setPayModal(null);
    toast.success('Kasbon dibayar.');
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stagger-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Piutang Pelanggan</p>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-500">{formatCurrency(totalKasbon)}</p>
        </div>
        <div className="stagger-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jatuh Tempo ≤ 7 Hari</p>
          <p className="text-2xl md:text-3xl font-extrabold text-red-500">{formatCurrency(due7Days)}</p>
        </div>
      </div>

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
            <thead><tr className="border-b-2 border-slate-100 dark:border-slate-800"><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Jatuh Tempo</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Pelanggan</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Detail Barang</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Sisa Tagihan</th><th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-center">Aksi</th></tr></thead>
            <tbody>
              {unpaidKasbons.length > 0 ? unpaidKasbons.map((k) => {
                const item = items.find((i) => i.id === k.itemId);
                const isOverdue = k.dueDate && new Date(k.dueDate) < now;
                return (
                  <tr key={k.id} className={`border-b border-slate-100/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isOverdue ? 'row-warning' : ''}`}>
                    <td className={`py-3 px-4 font-bold text-sm ${isOverdue ? 'text-red-500' : ''}`}>{formatDate(k.dueDate)}</td>
                    <td className="py-3 px-4"><p className="font-bold text-sm">{k.customerDetails?.name}</p><p className="text-xs text-slate-400">{k.customerDetails?.phone}</p></td>
                    <td className="py-3 px-4 text-sm text-slate-500 max-w-xs truncate">
                      {Array.isArray(k.items) ? (
                        k.items.map((si) => {
                          const i = items.find((it) => it.id === si.itemId);
                          return `${i?.name || '-'} (${si.quantity} ${i?.unit || ''})`;
                        }).join(', ')
                      ) : (
                        (() => {
                          const i = items.find((it) => it.id === k.itemId);
                          return `${i?.name || '-'} (${k.quantity} ${i?.unit || ''})`;
                        })()
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-500">{formatCurrency(k.remaining)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setDetailModal(k)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all btn-press">Detail</button>
                        <button onClick={() => setPayModal(k)} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-sm transition-all btn-press">Bayar</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada kasbon pelanggan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPayModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up border border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Terima Pembayaran Kasbon</h3>
              <button onClick={() => setPayModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-slate-400">Pelanggan</p><p className="font-bold">{payModal.customerDetails?.name}</p></div>
                <div className="text-right"><p className="text-xs text-slate-400">Sisa Tagihan</p><p className="font-bold text-amber-500 text-lg">{formatCurrency(payModal.remaining)}</p></div>
              </div>
              {payModal.paymentHistory?.length > 0 && (
                <div className="mb-4"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 dark:border-slate-800"><th className="py-2 text-left text-xs text-slate-400">Riwayat Bayar</th><th className="py-2 text-right text-xs text-slate-400">Jumlah</th></tr></thead><tbody>{payModal.paymentHistory.map((h, i) => (<tr key={i} className="border-b border-slate-100/60 dark:border-slate-800/60"><td className="py-2">{new Date(h.date).toLocaleDateString()}</td><td className="py-2 text-right">{formatCurrency(h.amount)}</td></tr>))}</tbody></table></div>
              )}
              <form onSubmit={handlePay}>
                <label className="text-sm font-semibold mb-1 block">Jumlah Diterima</label>
                <input name="amount" type="number" max={payModal.remaining} required className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm mb-4 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
                <div className="flex justify-end"><button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all btn-press">Catat Penerimaan</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
      {detailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDetailModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Rincian Nota Kasbon</h3>
              <button onClick={() => setDetailModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-4">
                <h4 className="font-extrabold text-xl tracking-wide">TB NS JAYA</h4>
                <p className="text-xs text-slate-400">Nota Kasbon Pelanggan</p>
                <div className="mt-2 text-left bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between"><span>No. Invoice:</span><span className="font-mono font-bold">{detailModal.id}</span></div>
                  <div className="flex justify-between"><span>Tanggal:</span><span>{new Date(detailModal.date).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Jatuh Tempo:</span><span className="text-red-500 font-bold">{formatDate(detailModal.dueDate)}</span></div>
                  <div className="flex justify-between"><span>Pelanggan:</span><span className="font-bold">{detailModal.customerDetails?.name || '-'}</span></div>
                  <div className="flex justify-between"><span>No. HP/WA:</span><span>{detailModal.customerDetails?.phone || '-'}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Barang</p>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.isArray(detailModal.items) ? (
                    detailModal.items.map((si, idx) => {
                      const itemDef = items.find((i) => i.id === si.itemId);
                      return (
                        <div key={idx} className="py-2.5 flex justify-between items-start text-sm">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{itemDef?.name || 'Barang Tidak Dikenal'}</p>
                            <p className="text-xs text-slate-400">{si.quantity} {itemDef?.unit || ''} x {formatCurrency(si.price)}</p>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(si.quantity * si.price)}</span>
                        </div>
                      );
                    })
                  ) : (
                    (() => {
                      const itemDef = items.find((i) => i.id === detailModal.itemId);
                      return (
                        <div className="py-2.5 flex justify-between items-start text-sm">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{itemDef?.name || 'Barang Tidak Dikenal'}</p>
                            <p className="text-xs text-slate-400">{detailModal.quantity} {itemDef?.unit || ''} x {formatCurrency(detailModal.pricePerItem || detailModal.totalPrice / (detailModal.quantity || 1))}</p>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(detailModal.totalPrice)}</span>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Belanja:</span>
                  <span className="font-semibold">{formatCurrency(detailModal.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-500">
                  <span>Sudah Dibayar (Termasuk DP):</span>
                  <span className="font-semibold">{formatCurrency(detailModal.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-500 text-base font-extrabold border-t border-slate-100 dark:border-slate-800 pt-1.5">
                  <span>Sisa Tagihan Kasbon:</span>
                  <span>{formatCurrency(detailModal.remaining)}</span>
                </div>
              </div>

              {detailModal.paymentHistory?.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Riwayat Pembayaran Cicilan</p>
                  <table className="w-full text-xs text-slate-500">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                        <th className="py-1">Tanggal</th>
                        <th className="py-1">Metode</th>
                        <th className="py-1 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                      {detailModal.paymentHistory.map((h, i) => (
                        <tr key={i}>
                          <td className="py-1.5">{new Date(h.date).toLocaleDateString('id-ID')}</td>
                          <td className="py-1.5 uppercase font-semibold text-[10px]">{h.method || 'tunai'}</td>
                          <td className="py-1.5 text-right font-bold text-slate-700 dark:text-slate-300">{formatCurrency(h.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
