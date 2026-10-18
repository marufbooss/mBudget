import React from 'react';
import { Account, Category, Transaction } from '../types/budget';
import { StorageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';
import { TrendingUp, TrendingDown, PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  accounts,
  transactions,
  categories,
  currency,
}) => {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const incomeTransactions = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryStats = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const catTransactions = expenseTransactions.filter((t) => t.categoryId === cat.id);
      const total = catTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cat,
        total,
        count: catTransactions.length,
        percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Daily average spend (assuming 30 day month)
  const dailyAverageSpend = totalExpense / 30;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Financial Analytics & Insights</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive breakdown of cash flows, burn rate, and category distribution
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase block">Savings Rate</span>
            <span className="text-emerald-400 font-bold text-sm">
              {savingsRate > 0 ? savingsRate.toFixed(1) : 0}%
            </span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase block">Avg Daily Burn</span>
            <span className="text-white font-bold text-sm">
              {StorageService.formatCurrency(dailyAverageSpend, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Total Inflows (This Period)</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              +{StorageService.formatCurrency(totalIncome, currency)}
            </span>
            <ArrowUpRight size={18} className="text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {incomeTransactions.length} deposit events
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Total Outflows (This Period)</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold font-mono text-rose-400">
              -{StorageService.formatCurrency(totalExpense, currency)}
            </span>
            <ArrowDownRight size={18} className="text-rose-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {expenseTransactions.length} payment events
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Net Liquidity Delta</span>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xl font-bold font-mono ${
                totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalIncome - totalExpense >= 0 ? '+' : ''}
              {StorageService.formatCurrency(totalIncome - totalExpense, currency)}
            </span>
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Retained surplus retained in accounts
          </span>
        </div>
      </div>

      {/* Category Deep Breakdown */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white">Expense Distribution by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked breakdown of outflows and share of monthly wallet
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {categoryStats.length} Active Categories
          </span>
        </div>

        <div className="space-y-4">
          {categoryStats.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={14} />
                  </div>
                  <span className="font-semibold text-white">{cat.name}</span>
                  <span className="text-[11px] text-slate-400">({cat.count} txns)</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">{cat.percentage.toFixed(1)}%</span>
                  <span className="text-white font-bold">
                    {StorageService.formatCurrency(cat.total, currency)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
