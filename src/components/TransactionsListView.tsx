import React, { useState } from 'react';
import { Account, Category, Transaction, TransactionType } from '../types/budget';
import { StorageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Trash2,
  Edit2,
  X,
  Plus,
} from 'lucide-react';

interface TransactionsListViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  currency: string;
  onOpenCreateModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsListView: React.FC<TransactionsListViewProps> = ({
  transactions,
  accounts,
  categories,
  currency,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  const getAccountName = (id: string) => {
    return accounts.find((a) => a.id === id)?.name || 'Account';
  };

  const getCategory = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId && t.toAccountId !== selectedAccountId) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const noteMatch = t.note?.toLowerCase().includes(q);
      const catMatch = getCategory(t.categoryId)?.name.toLowerCase().includes(q);
      const subMatch = t.subCategory?.toLowerCase().includes(q);
      const accMatch = getAccountName(t.accountId).toLowerCase().includes(q);
      if (!noteMatch && !catMatch && !subMatch && !accMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes, merchants, categories, or accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-hidden focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-hidden focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Incomes Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-hidden focus:border-emerald-500 max-w-[140px] truncate"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus size={15} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category & Note</th>
                <th className="py-3 px-4">Money Holder</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cat = getCategory(t.categoryId);
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';
                  const isTransfer = t.type === 'transfer';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        <div>{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(t.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Category & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat?.color || '#3b82f6'}20`,
                              color: cat?.color || '#3b82f6',
                            }}
                          >
                            <CategoryIcon
                              name={cat?.icon || (isTransfer ? 'ArrowRightLeft' : 'CircleDollarSign')}
                              size={16}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                              <span>{cat?.name || 'Category'}</span>
                              {t.subCategory && (
                                <span className="text-[11px] text-slate-400 font-normal">
                                  / {t.subCategory}
                                </span>
                              )}
                            </div>
                            {t.note && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                {t.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        {isTransfer ? (
                          <div className="flex items-center gap-1.5 text-blue-400 text-[11px]">
                            <span>{getAccountName(t.accountId)}</span>
                            <span>→</span>
                            <span>{getAccountName(t.toAccountId || '')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">{getAccountName(t.accountId)}</span>
                        )}
                      </td>

                      {/* Receipt */}
                      <td className="py-3.5 px-4 text-center">
                        {t.receiptUrl ? (
                          <button
                            onClick={() => setActiveReceiptUrl(t.receiptUrl!)}
                            className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="View Receipt Attachment"
                          >
                            <Receipt size={14} />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold">
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
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenEditModal(t)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Transaction"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete Transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Lightbox Modal */}
      {activeReceiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setActiveReceiptUrl(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Receipt size={15} className="text-emerald-400" />
                <span>Receipt Attachment Preview</span>
              </span>
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={activeReceiptUrl}
              alt="Receipt Attachment"
              className="max-h-[70vh] w-auto mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
