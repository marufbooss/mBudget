import React, { useState } from 'react';
import { Account, Transaction } from '../types/budget';
import { StorageService } from '../services/storageService';
import { ArrowRightLeft, X } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (transaction: Transaction) => void;
  accounts: Account[];
  currency: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  accounts,
  currency,
}) => {
  const activeAccounts = accounts.filter((a) => !a.isArchived && !a.isHidden);

  const [fromAccountId, setFromAccountId] = useState(
    activeAccounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState(
    activeAccounts[1]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const fromAccount = activeAccounts.find((a) => a.id === fromAccountId);
  const toAccount = activeAccounts.find((a) => a.id === toAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) return;

    const tx: Transaction = {
      id: `tx_tr_${Date.now()}`,
      type: 'transfer',
      amount: parsedAmount,
      date: new Date(date).toISOString(),
      accountId: fromAccountId,
      toAccountId: toAccountId,
      categoryId: 'cat_transfer',
      subCategory: toAccount?.cardType === 'credit' ? 'Credit Card Payment' : 'Internal Transfer',
      note: note.trim() || `Transfer from ${fromAccount?.name} to ${toAccount?.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onTransfer(tx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Internal Money Transfer</h2>
              <p className="text-[11px] text-slate-400">Move funds between accounts or pay card dues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Transfer Flow Visualizer */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            {/* From Account */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Source (From Money Holder)</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-blue-500"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — ({StorageService.formatCurrency(acc.currentBalance, currency)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center -my-1">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                ↓
              </div>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Destination (To Money Holder)</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-hidden focus:border-blue-500"
              >
                {activeAccounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — ({StorageService.formatCurrency(acc.currentBalance, currency)})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Transfer Amount ({currency}) *
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-base text-white font-mono font-bold focus:border-blue-500 outline-hidden"
              />
              {toAccount?.cardType === 'credit' && toAccount.currentBalance < 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.abs(toAccount.currentBalance).toFixed(2))}
                  className="absolute right-2 top-2 px-2 py-1 text-[10px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded font-mono"
                >
                  Pay Full Due (${Math.abs(toAccount.currentBalance).toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Card payment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

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
              disabled={fromAccountId === toAccountId || !amount}
              className="px-5 py-2 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors disabled:opacity-50"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
