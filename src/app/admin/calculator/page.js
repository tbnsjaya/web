'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Calculator, Info } from 'lucide-react';

export default function CalculatorPage() {
  const [hpp, setHpp] = useState('');
  const [margin, setMargin] = useState('');

  const hppVal = parseFloat(hpp) || 0;
  const marginVal = parseFloat(margin) || 0;
  const salePrice = hppVal > 0 && marginVal > 0 && marginVal < 100 ? hppVal / (1 - marginVal / 100) : 0;
  const profit = salePrice - hppVal;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        {/* Calculator */}
        <div className="stagger-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-5 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-500" /> Kalkulator Harga Jual
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold mb-1 block">Harga Pokok (HPP)</label>
              <input
                type="number"
                value={hpp}
                onChange={(e) => setHpp(e.target.value)}
                placeholder="Contoh: 50000"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Margin Keuntungan (%)</label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="Contoh: 20"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Harga Jual Ideal:</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
              {salePrice > 0 ? formatCurrency(salePrice) : 'Rp 0'}
            </p>
            <p className="text-sm font-bold text-emerald-500">
              Laba: {profit > 0 ? formatCurrency(profit) : 'Rp 0'}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="stagger-2 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" /> Info: Margin vs Markup
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>Margin</strong> dihitung dari harga jual. Menunjukkan berapa persen dari pendapatan yang menjadi laba.
              </p>
              <div className="px-4 py-3 bg-white/60 dark:bg-slate-900/60 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-400">
                Harga Jual = HPP / (1 - (Margin / 100))
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>Markup</strong> ditambahkan pada HPP. Menunjukkan persentase penambahan biaya.
              </p>
              <div className="px-4 py-3 bg-white/60 dark:bg-slate-900/60 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-400">
                Harga Jual = HPP × (1 + (Markup / 100))
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 Kalkulator ini menggunakan <strong>Margin</strong>. Untuk margin 20%, HPP Rp 50.000 → Harga Jual Rp 62.500.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
