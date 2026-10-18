/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Account, Category, Transaction, SyncMetadata } from './types/budget';
import { StorageService } from './services/storageService';
import { GoogleDriveService } from './services/googleDriveService';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { MoneyHoldersView } from './components/MoneyHoldersView';
import { TransactionsListView } from './components/TransactionsListView';
import { AnalyticsView } from './components/AnalyticsView';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AccountModal } from './components/AccountModal';
import { TransferModal } from './components/TransferModal';
import { TransactionModal } from './components/TransactionModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.getAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    StorageService.getTransactions()
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    StorageService.getCategories()
  );
  const [currency, setCurrency] = useState<string>(() => StorageService.getCurrency());
  const [syncMeta, setSyncMeta] = useState<SyncMetadata>(() =>
    GoogleDriveService.getSyncMetadata()
  );

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<Account | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Reload data from local database
  const reloadData = useCallback(() => {
    setAccounts(StorageService.getAccounts());
    setTransactions(StorageService.getTransactions());
    setCategories(StorageService.getCategories());
    setCurrency(StorageService.getCurrency());
    setSyncMeta(GoogleDriveService.getSyncMetadata());
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setSelectedTxForEdit(null);
        setIsTransactionModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTransferModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        setActiveTab('dashboard');
      } else if (e.key === 'f' || e.key === 'F') {
        setActiveTab('flutter_code');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Transactions
  const handleSaveTransaction = (tx: Transaction) => {
    if (selectedTxForEdit) {
      // Revert previous balance impact first, then add updated
      StorageService.deleteTransaction(selectedTxForEdit.id);
    }
    const res = StorageService.addTransaction(tx);
    setTransactions(res.transactions);
    setAccounts(res.accounts);
    setSelectedTxForEdit(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const res = StorageService.deleteTransaction(id);
    setTransactions(res.transactions);
    setAccounts(res.accounts);
  };

  // Handlers for Accounts (Money Holders)
  const handleSaveAccount = (account: Account) => {
    const currentAccounts = StorageService.getAccounts();
    const exists = currentAccounts.some((a) => a.id === account.id);
    let updated: Account[];
    if (exists) {
      updated = currentAccounts.map((a) => (a.id === account.id ? account : a));
    } else {
      updated = [...currentAccounts, account];
    }
    StorageService.saveAccounts(updated);
    setAccounts(updated);
    setSelectedAccountForEdit(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this Money Holder account? Transactions linked to it may be affected.'
      )
    ) {
      return;
    }
    const updated = accounts.filter((a) => a.id !== id);
    StorageService.saveAccounts(updated);
    setAccounts(updated);
  };

  const handleToggleHideAccount = (id: string) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, isHidden: !a.isHidden } : a));
    StorageService.saveAccounts(updated);
    setAccounts(updated);
  };

  // Categories Handlers
  const handleSaveCategory = (category: Category) => {
    const current = StorageService.getCategories();
    const updated = [...current, category];
    StorageService.saveCategories(updated);
    setCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    StorageService.saveCategories(updated);
    setCategories(updated);
  };

  // Currency handler
  const handleCurrencyChange = (code: string) => {
    StorageService.setCurrency(code);
    setCurrency(code);
  };

  // Calculate Net Worth
  const totalNetWorth = accounts
    .filter((a) => !a.isArchived && !a.isHidden)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  // Render View Content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            accounts={accounts}
            transactions={transactions}
            categories={categories}
            currency={currency}
            onOpenCreateTransaction={() => {
              setSelectedTxForEdit(null);
              setIsTransactionModalOpen(true);
            }}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToAccounts={() => setActiveTab('accounts')}
          />
        );

      case 'accounts':
        return (
          <MoneyHoldersView
            accounts={accounts}
            currency={currency}
            onOpenCreateModal={() => {
              setSelectedAccountForEdit(null);
              setIsAccountModalOpen(true);
            }}
            onOpenEditModal={(acc) => {
              setSelectedAccountForEdit(acc);
              setIsAccountModalOpen(true);
            }}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onToggleHideAccount={handleToggleHideAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        );

      case 'transactions':
        return (
          <TransactionsListView
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            currency={currency}
            onOpenCreateModal={() => {
              setSelectedTxForEdit(null);
              setIsTransactionModalOpen(true);
            }}
            onOpenEditModal={(tx) => {
              setSelectedTxForEdit(tx);
              setIsTransactionModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );

      case 'analytics':
        return (
          <AnalyticsView
            accounts={accounts}
            transactions={transactions}
            categories={categories}
            currency={currency}
          />
        );

      case 'categories':
        return (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Expense & Income Categories</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-built and custom categories with color palettes and subcategories
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-sm"
              >
                + Add / Manage Categories
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <span className="font-bold text-xs">{cat.name.substring(0, 2)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">
                        {cat.subCategories.length} subcategories
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      cat.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {cat.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sync':
        return (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Google Drive Cloud Synchronization</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Encrypted SQLite database backup and multi-device restoration
                </p>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-sm"
              >
                Open Sync Manager
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              mBudget automatically synchronizes your database (`mBudget_backup.db`) with Google
              Drive AppData storage folder. All records are timestamped for multi-device conflict
              resolution across Android, iOS, macOS, Windows, and Linux.
            </p>
          </div>
        );

      case 'flutter_code':
        return <FlutterCodeViewer />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Header */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncMeta={syncMeta}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenCreateTransaction={() => {
          setSelectedTxForEdit(null);
          setIsTransactionModalOpen(true);
        }}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')
        }
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Body */}
      {viewMode === 'desktop' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            totalNetWorth={totalNetWorth}
            currency={currency}
            onOpenCreateTransaction={() => {
              setSelectedTxForEdit(null);
              setIsTransactionModalOpen(true);
            }}
          />

          {/* Main Scrollable Canvas */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderTabContent()}
          </main>
        </div>
      ) : (
        /* Mobile Device Frame Mode */
        <MobileDeviceFrame
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCreateTransaction={() => {
            setSelectedTxForEdit(null);
            setIsTransactionModalOpen(true);
          }}
        >
          {renderTabContent()}
        </MobileDeviceFrame>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setSelectedTxForEdit(null);
        }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
        currency={currency}
        existingTransaction={selectedTxForEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleSaveTransaction}
        accounts={accounts}
        currency={currency}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedAccountForEdit(null);
        }}
        onSave={handleSaveAccount}
        existingAccount={selectedAccountForEdit}
        currency={currency}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <GoogleDriveSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onDataRestored={reloadData}
      />
    </div>
  );
}
