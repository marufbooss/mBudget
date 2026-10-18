import React from 'react';
import { NavTab } from './Sidebar';
import { SUPPORTED_CURRENCIES } from '../services/storageService';
import {
  Monitor,
  Smartphone,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { SyncMetadata } from '../types/budget';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  syncMeta: SyncMetadata;
  onOpenSyncModal: () => void;
  onOpenCreateTransaction: () => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  currency: string;
  onCurrencyChange: (code: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  syncMeta,
  onOpenSyncModal,
  onOpenCreateTransaction,
  viewMode,
  onToggleViewMode,
  currency,
  onCurrencyChange,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
      {/* Zone 1: Brand title wordmark */}
      <a
        href="#dashboard"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('dashboard');
        }}
        className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
          mB
        </span>
        <span>mBudget</span>
      </a>

      {/* Zone 2: 4-5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-emerald-400' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('accounts')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'accounts' ? 'text-emerald-400' : ''
          }`}
        >
          Money Holders
        </button>
        <button
          onClick={() => onTabChange('transactions')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'transactions' ? 'text-emerald-400' : ''
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'analytics' ? 'text-emerald-400' : ''
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange('flutter_code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'flutter_code' ? 'text-emerald-400' : ''
          }`}
        >
          Flutter Architecture
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 outline-hidden hover:border-slate-700"
          title="Change active currency"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>

        {/* View Mode Switcher (Desktop OS view vs Mobile Phone Frame view) */}
        <button
          onClick={onToggleViewMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title={viewMode === 'desktop' ? 'Switch to Mobile Phone View' : 'Switch to Desktop OS View'}
        >
          {viewMode === 'desktop' ? (
            <>
              <Smartphone size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Mobile Frame</span>
            </>
          ) : (
            <>
              <Monitor size={13} className="text-blue-400" />
              <span className="hidden sm:inline">Desktop View</span>
            </>
          )}
        </button>

        {/* Google Drive Sync status trigger */}
        <button
          onClick={onOpenSyncModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            syncMeta.cloudSyncEnabled
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Google Drive Sync status"
        >
          <Cloud size={13} />
          <span className="hidden sm:inline">
            {syncMeta.cloudSyncEnabled ? 'Drive Synced' : 'Cloud Sync'}
          </span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreateTransaction}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>New</span>
        </button>
      </div>
    </header>
  );
};
