import { Account, Category, DatabaseExport, Transaction } from '../types/budget';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  ACCOUNTS: 'mbudget_accounts_v1',
  TRANSACTIONS: 'mbudget_transactions_v1',
  CATEGORIES: 'mbudget_categories_v1',
  CURRENCY: 'mbudget_currency_v1',
  LAST_MODIFIED: 'mbudget_last_modified_v1',
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export class StorageService {
  public static getCurrency(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
  }

  public static setCurrency(currency: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    this.touchLastModified();
  }

  public static getLastModified(): string {
    const val = localStorage.getItem(STORAGE_KEYS.LAST_MODIFIED);
    if (!val) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, now);
      return now;
    }
    return val;
  }

  public static touchLastModified(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, new Date().toISOString());
  }

  public static getAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading accounts from storage', e);
    }
    this.saveAccounts(INITIAL_ACCOUNTS);
    return INITIAL_ACCOUNTS;
  }

  public static saveAccounts(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    this.touchLastModified();
  }

  public static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading categories from storage', e);
    }
    this.saveCategories(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }

  public static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.touchLastModified();
  }

  public static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading transactions from storage', e);
    }
    this.saveTransactions(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }

  public static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    this.touchLastModified();
  }

  // Real-time balance updater based on transactions
  public static addTransaction(transaction: Transaction): {
    transactions: Transaction[];
    accounts: Account[];
  } {
    const transactions = [transaction, ...this.getTransactions()];
    const accounts = this.getAccounts();

    const updatedAccounts = accounts.map((acc) => {
      let balanceChange = 0;

      // Handle Source Account
      if (acc.id === transaction.accountId) {
        if (transaction.type === 'expense') {
          balanceChange -= transaction.amount;
        } else if (transaction.type === 'income') {
          balanceChange += transaction.amount;
        } else if (transaction.type === 'transfer') {
          balanceChange -= transaction.amount;
        }
      }

      // Handle Destination Account (for Transfers)
      if (transaction.type === 'transfer' && acc.id === transaction.toAccountId) {
        balanceChange += transaction.amount;
      }

      // Handle Loan accounts special tracking if affected
      let newLoanPaid = acc.loanPaidAmount;
      if (acc.type === 'loan') {
        if (acc.id === transaction.toAccountId && transaction.type === 'transfer') {
          newLoanPaid = (acc.loanPaidAmount || 0) + transaction.amount;
        } else if (acc.id === transaction.accountId && transaction.type === 'expense') {
          newLoanPaid = (acc.loanPaidAmount || 0) + transaction.amount;
        }
      }

      return {
        ...acc,
        currentBalance: acc.currentBalance + balanceChange,
        loanPaidAmount: newLoanPaid,
        updatedAt: new Date().toISOString(),
      };
    });

    this.saveTransactions(transactions);
    this.saveAccounts(updatedAccounts);

    return { transactions, accounts: updatedAccounts };
  }

  public static deleteTransaction(id: string): {
    transactions: Transaction[];
    accounts: Account[];
  } {
    const transactions = this.getTransactions();
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return { transactions, accounts: this.getAccounts() };

    const accounts = this.getAccounts();
    // Reverse the balance impact
    const updatedAccounts = accounts.map((acc) => {
      let balanceReversal = 0;
      if (acc.id === txToDelete.accountId) {
        if (txToDelete.type === 'expense') {
          balanceReversal += txToDelete.amount;
        } else if (txToDelete.type === 'income') {
          balanceReversal -= txToDelete.amount;
        } else if (txToDelete.type === 'transfer') {
          balanceReversal += txToDelete.amount;
        }
      }

      if (txToDelete.type === 'transfer' && acc.id === txToDelete.toAccountId) {
        balanceReversal -= txToDelete.amount;
      }

      let newLoanPaid = acc.loanPaidAmount;
      if (acc.type === 'loan' && newLoanPaid) {
        if (acc.id === txToDelete.toAccountId || acc.id === txToDelete.accountId) {
          newLoanPaid = Math.max(0, newLoanPaid - txToDelete.amount);
        }
      }

      return {
        ...acc,
        currentBalance: acc.currentBalance + balanceReversal,
        loanPaidAmount: newLoanPaid,
        updatedAt: new Date().toISOString(),
      };
    });

    const remaining = transactions.filter((t) => t.id !== id);
    this.saveTransactions(remaining);
    this.saveAccounts(updatedAccounts);

    return { transactions: remaining, accounts: updatedAccounts };
  }

  public static formatCurrency(amount: number, currencyCode = 'USD'): string {
    const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || {
      symbol: '$',
    };
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}${curr.symbol}${absVal}`;
  }

  // Export database payload
  public static exportDatabase(): DatabaseExport {
    return {
      version: '1.2.0',
      appName: 'mBudget',
      timestamp: this.getLastModified(),
      currency: this.getCurrency(),
      accounts: this.getAccounts(),
      transactions: this.getTransactions(),
      categories: this.getCategories(),
    };
  }

  // Restore or import database
  public static importDatabase(payload: DatabaseExport): boolean {
    if (!payload.accounts || !payload.transactions || !payload.categories) {
      throw new Error('Invalid backup schema: missing accounts, transactions or categories');
    }
    this.saveAccounts(payload.accounts);
    this.saveTransactions(payload.transactions);
    this.saveCategories(payload.categories);
    if (payload.currency) {
      this.setCurrency(payload.currency);
    }
    this.touchLastModified();
    return true;
  }

  public static resetToDemo(): void {
    this.saveAccounts(INITIAL_ACCOUNTS);
    this.saveTransactions(INITIAL_TRANSACTIONS);
    this.saveCategories(INITIAL_CATEGORIES);
    this.setCurrency('USD');
    this.touchLastModified();
  }
}
