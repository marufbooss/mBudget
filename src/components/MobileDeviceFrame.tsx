import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  BarChart3,
  Code2,
  Plus,
  Wifi,
  Battery,
} from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCreateTransaction: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  onOpenCreateTransaction,
}) => {
  return (
    <div className="py-6 px-4 flex justify-center items-center min-h-[calc(100vh-60px)] bg-slate-950/60">
      {/* Mobile Chassis Frame */}
      <div className="relative w-full max-w-[414px] h-[860px] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-700/50">
        {/* Dynamic Island / Notch & Top Status Bar */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950 shrink-0 select-none z-30">
          <span className="font-semibold font-mono">9:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center -mt-1 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi size={12} />
            <Battery size={13} className="text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Mobile Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 relative">
          {children}
        </div>

        {/* Floating Action Button (FAB) for quick expense entry */}
        <button
          onClick={onOpenCreateTransaction}
          className="absolute bottom-16 right-5 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 z-30"
          title="Quick Expense Entry"
        >
          <Plus size={22} className="stroke-[2.5]" />
        </button>

        {/* Mobile Bottom Navigation Bar */}
        <div className="bg-slate-900/95 border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shrink-0 z-20 backdrop-blur-md">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'Holders', icon: Wallet },
            { id: 'transactions', label: 'Ledger', icon: ReceiptText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'flutter_code', label: 'Flutter', icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Home Indicator bar */}
        <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto my-1.5 shrink-0" />
      </div>
    </div>
  );
};
