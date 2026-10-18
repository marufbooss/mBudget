import React, { useState } from 'react';
import { Account, AccountType, CardType, LoanType } from '../types/budget';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { X, Check } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  existingAccount?: Account | null;
  currency: string;
}

const COLOR_PRESETS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAccount,
  currency,
}) => {
  const [type, setType] = useState<AccountType>(existingAccount?.type || 'bank');
  const [cardType, setCardType] = useState<CardType>(existingAccount?.cardType || 'credit');
  const [loanType, setLoanType] = useState<LoanType>(existingAccount?.loanType || 'borrowed');
  const [name, setName] = useState(existingAccount?.name || '');
  const [institutionName, setInstitutionName] = useState(existingAccount?.institutionName || '');
  const [initialBalance, setInitialBalance] = useState(
    existingAccount ? existingAccount.initialBalance.toString() : '0'
  );
  const [creditLimit, setCreditLimit] = useState(
    existingAccount?.creditLimit ? existingAccount.creditLimit.toString() : '5000'
  );
  const [dueDate, setDueDate] = useState(existingAccount?.dueDate || '');
  const [totalLoanAmount, setTotalLoanAmount] = useState(
    existingAccount?.totalLoanAmount ? existingAccount.totalLoanAmount.toString() : '1000'
  );
  const [interestRate, setInterestRate] = useState(
    existingAccount?.interestRate ? existingAccount.interestRate.toString() : '0'
  );
  const [selectedColor, setSelectedColor] = useState(existingAccount?.color || '#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState(existingAccount?.iconName || 'Landmark');
  const [mask, setMask] = useState(existingAccount?.accountNumberMask || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initBal = parseFloat(initialBalance) || 0;
    const currentBal = existingAccount ? existingAccount.currentBalance : initBal;

    const accountData: Account = {
      id: existingAccount?.id || `acc_${Date.now()}`,
      name: name.trim(),
      type,
      cardType: type === 'card' ? cardType : undefined,
      loanType: type === 'loan' ? loanType : undefined,
      currency,
      initialBalance: initBal,
      currentBalance: currentBal,
      creditLimit: type === 'card' && cardType === 'credit' ? parseFloat(creditLimit) || 0 : undefined,
      dueDate: (type === 'card' && cardType === 'credit') || type === 'loan' ? dueDate : undefined,
      totalLoanAmount: type === 'loan' ? parseFloat(totalLoanAmount) || 0 : undefined,
      loanPaidAmount: existingAccount?.loanPaidAmount || 0,
      interestRate: type === 'loan' ? parseFloat(interestRate) || 0 : undefined,
      color: selectedColor,
      iconName: selectedIcon,
      institutionName: institutionName.trim() || undefined,
      accountNumberMask: mask.trim() ? (mask.startsWith('••••') ? mask : `•••• ${mask}`) : undefined,
      isArchived: existingAccount?.isArchived || false,
      isHidden: existingAccount?.isHidden || false,
      createdAt: existingAccount?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(accountData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {existingAccount ? 'Edit Money Holder' : 'Create Money Holder'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure bank accounts, credit/debit cards, physical cash, or debts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Account Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'bank', label: 'Bank', icon: 'Landmark' },
                { type: 'card', label: 'Card', icon: 'CreditCard' },
                { type: 'cash', label: 'Cash', icon: 'Banknote' },
                { type: 'loan', label: 'Loan/Debt', icon: 'HandCoins' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setType(opt.type as AccountType);
                    if (opt.type === 'bank') setSelectedIcon('Landmark');
                    if (opt.type === 'card') setSelectedIcon('CreditCard');
                    if (opt.type === 'cash') setSelectedIcon('Banknote');
                    if (opt.type === 'loan') setSelectedIcon('HandCoins');
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-xs font-medium ${
                    type === opt.type
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-xs'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CategoryIcon name={opt.icon} size={18} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtype for Cards or Loans */}
          {type === 'card' && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-xs font-medium text-slate-300">Card Specification</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCardType('credit')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    cardType === 'credit'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Credit Card (With Dues & Due Date)
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('debit')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    cardType === 'debit'
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Debit Card (Direct Account Linked)
                </button>
              </div>

              {cardType === 'credit' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Credit Limit ({currency})</label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-rose-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Payment Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-rose-500 outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'loan' && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-xs font-medium text-slate-300">Loan Direction</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoanType('borrowed')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    loanType === 'borrowed'
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  I Borrowed (I owe someone/bank)
                </button>
                <button
                  type="button"
                  onClick={() => setLoanType('lent')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    loanType === 'lent'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  I Lent (Someone owes me)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Principal Amount</label>
                  <input
                    type="number"
                    value={totalLoanAmount}
                    onChange={(e) => setTotalLoanAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Interest Rate % (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Name & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Holder Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Primary Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Financial Institution</label>
              <input
                type="text"
                placeholder="e.g. Chase / Marcus / Wallet"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Initial Balance & Account Number Mask */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === 'card' && cardType === 'credit'
                  ? 'Current Outstanding Due (negative)'
                  : 'Starting Balance (' + currency + ')'}
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Last 4 Digits / Mask</label>
              <input
                type="text"
                placeholder="e.g. 4821"
                maxLength={8}
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Color & Icon Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Accent Color</label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
              {AVAILABLE_ICONS.slice(0, 16).map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-2 rounded-lg border transition-all ${
                    selectedIcon === iconName
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <CategoryIcon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              {existingAccount ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
