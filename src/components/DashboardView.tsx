import React, { useState } from 'react';
import { Account, Category, TimeRange, Transaction } from '../types/budget';
import { StorageService } from '../services/storageService';
import { InteractiveCharts } from './InteractiveCharts';
import { CategoryIcon } from './CategoryIcon';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  HandCoins,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onOpenCreateTransaction: () => void;
  onOpenTransferModal: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToAccounts: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  categories,
  currency,
  onOpenCreateTransaction,
  onOpenTransferModal,
  onNavigateToTransactions,
  onNavigateToAccounts,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Filter transactions by timeRange
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    if (timeRange === 'today') {
      return tDate.toDateString() === now.toDateString();
    }
    if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return tDate >= oneWeekAgo;
    }
    if (timeRange === 'month') {
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    }
    return true;
  });

  // KPI Calculations
  // Total Net worth: all accounts balance (negative cards subtract automatically)
  const totalNetWorth = accounts
    .filter((a) => !a.isArchived && !a.isHidden)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  // Incomes & Expenses in chosen period
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Active Credit Card Dues
  const creditCardAccounts = accounts.filter(
    (a) => a.type === 'card' && a.cardType === 'credit'
  );
  const activeCreditCardDues = creditCardAccounts
    .filter((a) => a.currentBalance < 0)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  // Earliest Credit Card Due Date
  const nextDueCard = creditCardAccounts
    .filter((a) => a.dueDate && a.currentBalance < 0)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  // Total Loaned & Loan Paid Tracking
  const loanAccounts = accounts.filter((a) => a.type === 'loan');
  const borrowedAccounts = loanAccounts.filter((a) => a.loanType === 'borrowed');
  const totalBorrowedPrincipal = borrowedAccounts.reduce(
    (sum, a) => sum + (a.totalLoanAmount || Math.abs(a.initialBalance)),
    0
  );
  const totalLoanPaid = borrowedAccounts.reduce(
    (sum, a) => sum + (a.loanPaidAmount || 0),
    0
  );
  const currentLoanRemaining = borrowedAccounts.reduce(
    (sum, a) => sum + Math.abs(a.currentBalance),
    0
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Time filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as TimeRange)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick entry triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <ArrowRightLeft size={14} className="text-blue-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={onOpenCreateTransaction}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Credit Card Due Alert Banner (if dues exist) */}
      {activeCreditCardDues > 0 && nextDueCard && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Credit Card Payment Due Approaching
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Due {nextDueCard.dueDate}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Outstanding balance on <span className="font-semibold">{nextDueCard.name}</span> is{' '}
                <span className="font-mono font-bold">
                  {StorageService.formatCurrency(Math.abs(nextDueCard.currentBalance), currency)}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTransferModal}
            className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            Pay Card Now
          </button>
        </div>
      )}

      {/* Section 3.1: Text-Based Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall Total Net Worth */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Net Worth</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {StorageService.formatCurrency(totalNetWorth, currency)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Combined assets minus active dues
            </span>
          </div>
        </div>

        {/* 2. Total Monthly Inflow & Outflow */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Cash Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              +{StorageService.formatCurrency(totalIncome, currency)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Net Savings: {StorageService.formatCurrency(netSavings, currency)}
            </span>
          </div>
        </div>

        {/* 3. Monthly Outflow */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              -{StorageService.formatCurrency(totalExpense, currency)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {filteredTransactions.filter((t) => t.type === 'expense').length} transactions logged
            </span>
          </div>
        </div>

        {/* 4. Active Credit Card & Loan Tracking */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Credit Card & Loans</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <HandCoins size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">
                {StorageService.formatCurrency(activeCreditCardDues, currency)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">CC Dues</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Loan Paid:</span>
              <span className="font-mono text-white">
                {StorageService.formatCurrency(totalLoanPaid, currency)} / {StorageService.formatCurrency(totalBorrowedPrincipal, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3.2: Graphical Visualizations */}
      <InteractiveCharts
        accounts={accounts}
        transactions={filteredTransactions}
        categories={categories}
        currency={currency}
      />

      {/* Section 3.3: Recent Transactions Strip */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest financial activity across your money holders
            </p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View All Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-800/40">
          {transactions.slice(0, 5).map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            const acc = accounts.find((a) => a.id === t.accountId);
            const isExpense = t.type === 'expense';
            const isIncome = t.type === 'income';

            return (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat?.color || '#3b82f6'}20`,
                      color: cat?.color || '#3b82f6',
                    }}
                  >
                    <CategoryIcon
                      name={cat?.icon || (t.type === 'transfer' ? 'ArrowRightLeft' : 'CircleDollarSign')}
                      size={18}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {cat?.name || 'Transaction'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {t.note || acc?.name || 'Personal log'} · {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono font-bold shrink-0">
                  <span
                    className={
                      isIncome
                        ? 'text-emerald-400'
                        : isExpense
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {StorageService.formatCurrency(t.amount, currency)}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-sans font-normal">
                    {acc?.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
