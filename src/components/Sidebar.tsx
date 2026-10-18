import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  BarChart3,
  Tags,
  Cloud,
  Code2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export type NavTab =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'analytics'
  | 'categories'
  | 'sync'
  | 'flutter_code';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalNetWorth: number;
  currency: string;
  onOpenCreateTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  totalNetWorth,
  currency,
  onOpenCreateTransaction,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Money Holders', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'sync', label: 'Google Drive Sync', icon: Cloud },
    { id: 'flutter_code', label: 'Flutter Architecture', icon: Code2 },
  ];

  return (
    <aside
      className={`h-screen bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand & Collapse Toggle */}
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
                <span className="font-bold text-slate-950 text-sm">mB</span>
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">mBudget</span>
                <span className="text-[10px] text-emerald-400 block -mt-1 font-mono">v1.2 Cross-Platform</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <span className="font-bold text-slate-950 text-sm">mB</span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Quick Log Action */}
        <div className="p-3">
          <button
            onClick={onOpenCreateTransaction}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm ${
              isCollapsed ? 'p-2' : ''
            }`}
          >
            <Plus size={16} />
            {!isCollapsed && <span>Quick Expense (N)</span>}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-emerald-400 border border-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
                title={item.label}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary & Shortcuts Guide */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {!isCollapsed ? (
          <>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Liquidity</span>
              <span className="text-sm font-bold font-mono text-white tracking-tight mt-0.5 block">
                {StorageService.formatCurrency(totalNetWorth, currency)}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 space-y-1 font-mono">
              <div>Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">N</kbd> New Transaction</div>
              <div>Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">T</kbd> Transfer</div>
              <div>Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">F</kbd> Flutter Code</div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono">mB</span>
          </div>
        )}
      </div>
    </aside>
  );
};
