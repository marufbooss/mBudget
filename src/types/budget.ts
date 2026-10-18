export type AccountType = 'bank' | 'card' | 'cash' | 'loan';

export type CardType = 'credit' | 'debit';
export type LoanType = 'borrowed' | 'lent'; // Borrowed from bank/person (we owe) or Lent to someone (they owe us)

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  cardType?: CardType;
  loanType?: LoanType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  creditLimit?: number; // for credit cards
  dueDate?: string; // payment deadline for credit cards (YYYY-MM-DD)
  minPayment?: number;
  totalLoanAmount?: number; // for loan tracking
  loanPaidAmount?: number;
  interestRate?: number;
  color: string;
  iconName: string;
  institutionName?: string;
  accountNumberMask?: string; // e.g. '•••• 4821'
  isArchived: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  subCategories: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO 8601 string
  accountId: string; // Source account (or destination for income)
  toAccountId?: string; // For transfers
  categoryId: string;
  subCategory?: string;
  note?: string;
  receiptUrl?: string; // Data URL or storage link
  tags?: string[];
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface DateFilter {
  range: TimeRange;
  startDate?: string;
  endDate?: string;
}

export interface SyncMetadata {
  lastSyncTimestamp: string | null;
  remoteTimestamp: string | null;
  cloudSyncEnabled: boolean;
  driveFileName: string;
  driveFolder: string;
  accountEmail: string | null;
  status: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';
  errorMessage?: string;
}

export interface DatabaseExport {
  version: string;
  appName: string;
  timestamp: string;
  currency: string;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}
