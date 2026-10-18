import React, { useState, useRef } from 'react';
import { Account, Category, Transaction, TransactionType } from '../types/budget';
import { StorageService } from '../services/storageService';
import { CategoryIcon } from './CategoryIcon';
import { X, Upload, Trash2, Camera, ArrowRightLeft } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  accounts: Account[];
  categories: Category[];
  currency: string;
  existingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  currency,
  existingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>(
    existingTransaction?.type || 'expense'
  );
  const [amount, setAmount] = useState(
    existingTransaction ? existingTransaction.amount.toString() : ''
  );
  const [accountId, setAccountId] = useState(
    existingTransaction?.accountId || accounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState(
    existingTransaction?.toAccountId || accounts[1]?.id || ''
  );
  const [categoryId, setCategoryId] = useState(
    existingTransaction?.categoryId ||
      (type === 'income' ? 'cat_salary' : 'cat_food')
  );
  const [subCategory, setSubCategory] = useState(
    existingTransaction?.subCategory || ''
  );
  const [date, setDate] = useState(
    existingTransaction
      ? existingTransaction.date.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    existingTransaction
      ? new Date(existingTransaction.date).toTimeString().substring(0, 5)
      : '12:00'
  );
  const [note, setNote] = useState(existingTransaction?.note || '');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    existingTransaction?.receiptUrl
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    type === 'transfer' ? c.id === 'cat_transfer' : c.type === type
  );

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!accountId) return;

    const fullIsoDate = new Date(`${date}T${time}:00`).toISOString();

    const tx: Transaction = {
      id: existingTransaction?.id || `tx_${Date.now()}`,
      type,
      amount: parsedAmount,
      date: fullIsoDate,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'transfer' ? 'cat_transfer' : categoryId,
      subCategory: subCategory.trim() || undefined,
      note: note.trim() || undefined,
      receiptUrl,
      createdAt: existingTransaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {existingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Log income, expense, or internal transfer with receipts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Type Selector: Expense, Income, Transfer */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('cat_food');
                setSubCategory('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense (Money Out)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('cat_salary');
                setSubCategory('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income (Money In)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategoryId('cat_transfer');
                setSubCategory('Account Transfer');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'transfer'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Transfer (Internal)
            </button>
          </div>

          {/* Amount Input with Currency Display */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-white focus:border-emerald-500 outline-hidden"
              />
              <div className="absolute right-3 top-3 text-xs font-mono text-slate-500">
                {currency}
              </div>
            </div>
          </div>

          {/* Money Holder Selector */}
          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === 'expense' ? 'Paid From (Money Holder)' : 'Deposit Into (Money Holder)'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-hidden"
              >
                {accounts
                  .filter((a) => !a.isArchived)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — ({StorageService.formatCurrency(acc.currentBalance, currency)})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">From Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-hidden focus:border-blue-500"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Category & Subcategory Selection */}
          {type !== 'transfer' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setSubCategory(cat.subCategories[0] || '');
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        categoryId === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={14} />
                      </div>
                      <span className="text-[11px] font-medium truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (if any) */}
              {selectedCategory && selectedCategory.subCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sub-category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.subCategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubCategory(sub)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          subCategory === sub
                            ? 'bg-slate-700 text-white border border-slate-600'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery restock at Trader Joe's"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Receipt Photo Uploader */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Receipt / Invoice Attachment
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleReceiptUpload}
              className="hidden"
            />
            {receiptUrl ? (
              <div className="relative rounded-xl border border-slate-800 p-2 bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                  />
                  <div>
                    <span className="text-xs text-slate-200 font-medium block">
                      Receipt Attached
                    </span>
                    <span className="text-[10px] text-emerald-400">Ready for cloud backup</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-950/60 transition-colors"
              >
                <Camera size={16} className="text-slate-400" />
                <span>Upload receipt photo (PNG, JPG)</span>
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
            >
              {existingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
