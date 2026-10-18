import React, { useState } from 'react';
import { Account } from '../types/budget';
import { StorageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';
import {
  Plus,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface MoneyHoldersViewProps {
  accounts: Account[];
  currency: string;
  onOpenCreateModal: () => void;
  onOpenEditModal: (account: Account) => void;
  onOpenTransferModal: (sourceAccountId?: string) => void;
  onToggleHideAccount: (accountId: string) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const MoneyHoldersView: React.FC<MoneyHoldersViewProps> = ({
  accounts,
  currency,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenTransferModal,
  onToggleHideAccount,
  onDeleteAccount,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAccounts = accounts.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  // Calculate Net Worth
  const totalNetWorth = accounts
    .filter((a) => !a.isArchived && !a.isHidden)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const getDaysUntilDue = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Money Holders</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {accounts.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total Combined Liquid Balance:{' '}
            <span className="font-mono font-bold text-emerald-400">
              {StorageService.formatCurrency(totalNetWorth, currency)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTransferModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
          >
            <ArrowRightLeft size={14} className="text-blue-400" />
            <span>Internal Transfer</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'bank', label: 'Bank Deposits' },
          { id: 'card', label: 'Payment Cards' },
          { id: 'cash', label: 'Cash & Wallets' },
          { id: 'loan', label: 'Loans & Debts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAccounts.map((acc) => {
          const daysLeft = getDaysUntilDue(acc.dueDate);
          const isCreditCard = acc.type === 'card' && acc.cardType === 'credit';
          const isDebt = acc.type === 'loan';

          return (
            <div
              key={acc.id}
              className={`relative overflow-hidden bg-slate-900/90 border rounded-2xl p-5 transition-all group flex flex-col justify-between ${
                acc.isHidden
                  ? 'opacity-60 border-dashed border-slate-800'
                  : 'border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${acc.color}20`,
                        color: acc.color,
                        border: `1px solid ${acc.color}40`,
                      }}
                    >
                      <CategoryIcon name={acc.iconName} size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{acc.name}</h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {acc.institutionName || acc.type.toUpperCase()}{' '}
                        {acc.accountNumberMask && <span className="font-mono text-slate-500">· {acc.accountNumberMask}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleHideAccount(acc.id)}
                      title={acc.isHidden ? 'Unhide Account' : 'Hide Account'}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      {acc.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => onOpenEditModal(acc)}
                      title="Edit Account"
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteAccount(acc.id)}
                      title="Delete Account"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mt-4">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {isCreditCard ? 'Outstanding Due Balance' : isDebt ? 'Current Obligation' : 'Available Balance'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span
                      className={`text-2xl font-bold font-mono tracking-tight ${
                        acc.currentBalance < 0
                          ? 'text-rose-400'
                          : acc.currentBalance > 0
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {StorageService.formatCurrency(acc.currentBalance, currency)}
                    </span>
                  </div>
                </div>

                {/* Credit Card Specific Dues Banner */}
                {isCreditCard && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Limit: {StorageService.formatCurrency(acc.creditLimit || 5000, currency)}</span>
                      <span>
                        Available:{' '}
                        {StorageService.formatCurrency((acc.creditLimit || 5000) - Math.abs(acc.currentBalance), currency)}
                      </span>
                    </div>

                    {/* Due Date Alert Flag */}
                    {acc.dueDate && (
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] ${
                          daysLeft !== null && daysLeft <= 7
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={12} />
                          <span>Due: {acc.dueDate}</span>
                        </div>
                        <span className="font-mono font-medium">
                          {daysLeft !== null
                            ? daysLeft < 0
                              ? 'Overdue'
                              : daysLeft === 0
                              ? 'Due Today'
                              : `${daysLeft} days left`
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Loan Progress Specific */}
                {isDebt && acc.totalLoanAmount && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Paid: {StorageService.formatCurrency(acc.loanPaidAmount || 0, currency)}</span>
                      <span className="font-mono">
                        {(( (acc.loanPaidAmount || 0) / acc.totalLoanAmount ) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            (( (acc.loanPaidAmount || 0) / acc.totalLoanAmount ) * 100),
                            100
                          )}%`,
                        }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Action */}
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {acc.type === 'bank'
                    ? 'Direct Deposit Eligible'
                    : acc.type === 'card'
                    ? 'Card Payment Gateway'
                    : acc.type === 'cash'
                    ? 'Physical Tender'
                    : 'Amortized Loan'}
                </span>
                <button
                  onClick={() => onOpenTransferModal(acc.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <span>Transfer</span>
                  <ArrowRightLeft size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
