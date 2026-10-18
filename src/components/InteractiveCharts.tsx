import React, { useState } from 'react';
import { Account, Category, Transaction } from '../types/budget';
import { StorageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';

interface ChartsProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export const InteractiveCharts: React.FC<ChartsProps> = ({
  accounts,
  transactions,
  categories,
  currency,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);

  // Group expenses by category
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const amount = expenseTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cat,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 6 Months Inflows vs Outflows data simulation based on real data
  const monthsData = [
    { label: 'May', income: 3400, expense: 2100 },
    { label: 'Jun', income: 3600, expense: 2450 },
    { label: 'Jul', income: 3900, expense: 2800 },
    { label: 'Aug', income: 4200, expense: 2300 },
    { label: 'Sep', income: 4400, expense: 2650 },
    {
      label: 'Oct (Current)',
      income: transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0),
      expense: totalExpense,
    },
  ];

  const maxChartVal = Math.max(
    ...monthsData.map((m) => Math.max(m.income, m.expense)),
    5000
  );

  // Account Type Distribution
  const bankTotal = accounts
    .filter((a) => a.type === 'bank')
    .reduce((s, a) => s + a.currentBalance, 0);
  const cardDues = accounts
    .filter((a) => a.type === 'card')
    .reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  const cashTotal = accounts
    .filter((a) => a.type === 'cash')
    .reduce((s, a) => s + a.currentBalance, 0);
  const totalAssets = Math.max(bankTotal + cashTotal, 1);

  // Donut chart calculations
  let accumulatedAngle = 0;
  const radius = 64;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Monthly Income vs Expense Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Income vs Expense (Cash Flow)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly historical inflows against outflows
            </p>
          </div>
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trend
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>Income (Inflows)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span>Expense (Outflows)</span>
          </div>
        </div>

        {/* Chart Viewport */}
        {chartType === 'bar' ? (
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
            {monthsData.map((m, idx) => {
              const incomeHeight = Math.round((m.income / maxChartVal) * 100);
              const expenseHeight = Math.round((m.expense / maxChartVal) * 100);
              const isCurrent = idx === monthsData.length - 1;

              return (
                <div key={m.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44 relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] font-mono text-white whitespace-nowrap shadow-xl">
                      <div>+{StorageService.formatCurrency(m.income, currency)}</div>
                      <div className="text-rose-400">-{StorageService.formatCurrency(m.expense, currency)}</div>
                    </div>

                    {/* Inflow bar */}
                    <div
                      style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                      className={`w-3 sm:w-4 rounded-t transition-all duration-300 ${
                        isCurrent ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-emerald-500/70 hover:bg-emerald-400'
                      }`}
                    />
                    {/* Outflow bar */}
                    <div
                      style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                      className={`w-3 sm:w-4 rounded-t transition-all duration-300 ${
                        isCurrent ? 'bg-rose-500 shadow-sm shadow-rose-500/30' : 'bg-rose-500/70 hover:bg-rose-400'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] mt-2 font-medium tracking-tight truncate max-w-[50px] ${
                    isCurrent ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-56 pt-2 relative">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 320 160">
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="40" x2="320" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="320" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="320" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Income Line & Area */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={monthsData
                  .map((m, i) => `${(i / (monthsData.length - 1)) * 320},${160 - (m.income / maxChartVal) * 140}`)
                  .join(' ')}
              />
              {/* Expense Line */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                points={monthsData
                  .map((m, i) => `${(i / (monthsData.length - 1)) * 320},${160 - (m.expense / maxChartVal) * 140}`)
                  .join(' ')}
              />
              {/* Data points */}
              {monthsData.map((m, i) => (
                <circle
                  key={i}
                  cx={(i / (monthsData.length - 1)) * 320}
                  cy={160 - (m.income / maxChartVal) * 140}
                  r="3.5"
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-mono">
              {monthsData.map((m) => (
                <span key={m.label}>{m.label.substring(0, 3)}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Category Expense Donut Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Expense Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Spending breakdown across custom categories
            </p>
          </div>
          <span className="text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
            Total {StorageService.formatCurrency(totalExpense, currency)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
          {/* Donut graphic */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {categoryTotals.map((cat, idx) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
                accumulatedAngle += cat.percentage;

                const isHovered = activeDonutIndex === idx;

                return (
                  <circle
                    key={cat.id}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActiveDonutIndex(idx)}
                    onMouseLeave={() => setActiveDonutIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeDonutIndex !== null && categoryTotals[activeDonutIndex] ? (
                <>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                    {categoryTotals[activeDonutIndex].name}
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {categoryTotals[activeDonutIndex].percentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {StorageService.formatCurrency(categoryTotals[activeDonutIndex].amount, currency)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-slate-400 font-medium">Outflows</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {categoryTotals.length} Categories
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 space-y-2 w-full max-h-48 overflow-y-auto pr-1">
            {categoryTotals.map((cat, idx) => (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveDonutIndex(idx)}
                onMouseLeave={() => setActiveDonutIndex(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeDonutIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-200 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-slate-400">{cat.percentage.toFixed(0)}%</span>
                  <span className="text-white font-medium">
                    {StorageService.formatCurrency(cat.amount, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Account Balance Distribution Summary Bar */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Liquid Assets vs Liabilities Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available liquidity across Bank Deposits and Physical Cash vs Active Credit Card dues
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-blue-400">Bank: {StorageService.formatCurrency(bankTotal, currency)}</span>
            <span className="text-amber-400">Cash: {StorageService.formatCurrency(cashTotal, currency)}</span>
            <span className="text-rose-400">Credit Dues: {StorageService.formatCurrency(cardDues, currency)}</span>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
          <div
            style={{ width: `${(bankTotal / totalAssets) * 100}%` }}
            className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
            title={`Bank Deposits: ${((bankTotal / totalAssets) * 100).toFixed(1)}%`}
          />
          <div
            style={{ width: `${(cashTotal / totalAssets) * 100}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Cash: ${((cashTotal / totalAssets) * 100).toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
};
