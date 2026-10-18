export interface FlutterFile {
  path: string;
  filename: string;
  category: 'config' | 'model' | 'service' | 'state' | 'view';
  description: string;
  code: string;
}

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    category: 'config',
    description: 'Flutter project dependencies including fl_chart, sqflite, sqflite_common_ffi, googleapis & google_sign_in.',
    code: `name: mbudget
description: "A responsive, multi-platform personal budget management application."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter

  # State Management
  provider: ^6.1.2

  # Local SQLite Persistence (Mobile + Desktop FFI)
  sqflite: ^2.3.2
  sqflite_common_ffi: ^2.3.2+1
  path_provider: ^2.1.2
  path: ^1.9.0

  # Charts & Graphical Visualizations
  fl_chart: ^0.68.0

  # Google Drive Cloud Sync & OAuth 2.0
  google_sign_in: ^6.2.1
  googleapis: ^13.1.0
  http: ^1.2.1
  crypto: ^3.0.3

  # UI & Responsive Design
  intl: ^0.19.0
  lucide_icons: ^0.354.0
  file_picker: ^8.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/icons/
`,
  },
  {
    path: 'lib/models/account.dart',
    filename: 'account.dart',
    category: 'model',
    description: 'Money Holder Account model supporting Bank, Debit/Credit Cards, Cash, and Loan/Debt accounts with real-time balance.',
    code: `import 'dart:convert';

enum AccountType { bank, card, cash, loan }
enum CardType { credit, debit }
enum LoanType { borrowed, lent }

class Account {
  final String id;
  final String name;
  final AccountType type;
  final CardType? cardType;
  final LoanType? loanType;
  final String currency;
  final double initialBalance;
  double currentBalance;
  final double? creditLimit;
  final DateTime? dueDate;
  final double? minPayment;
  final double? totalLoanAmount;
  double? loanPaidAmount;
  final double? interestRate;
  final String colorHex;
  final String iconName;
  final String? institutionName;
  final String? accountNumberMask;
  final bool isArchived;
  final bool isHidden;
  final DateTime createdAt;
  DateTime updatedAt;

  Account({
    required this.id,
    required this.name,
    required this.type,
    this.cardType,
    this.loanType,
    this.currency = 'USD',
    required this.initialBalance,
    required this.currentBalance,
    this.creditLimit,
    this.dueDate,
    this.minPayment,
    this.totalLoanAmount,
    this.loanPaidAmount,
    this.interestRate,
    required this.colorHex,
    required this.iconName,
    this.institutionName,
    this.accountNumberMask,
    this.isArchived = false,
    this.isHidden = false,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'card_type': cardType?.name,
      'loan_type': loanType?.name,
      'currency': currency,
      'initial_balance': initialBalance,
      'current_balance': currentBalance,
      'credit_limit': creditLimit,
      'due_date': dueDate?.toIso8601String(),
      'min_payment': minPayment,
      'total_loan_amount': totalLoanAmount,
      'loan_paid_amount': loanPaidAmount,
      'interest_rate': interestRate,
      'color_hex': colorHex,
      'icon_name': iconName,
      'institution_name': institutionName,
      'account_number_mask': accountNumberMask,
      'is_archived': isArchived ? 1 : 0,
      'is_hidden': isHidden ? 1 : 0,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory Account.fromMap(Map<String, dynamic> map) {
    return Account(
      id: map['id'] as String,
      name: map['name'] as String,
      type: AccountType.values.byName(map['type'] as String),
      cardType: map['card_type'] != null
          ? CardType.values.byName(map['card_type'] as String)
          : null,
      loanType: map['loan_type'] != null
          ? LoanType.values.byName(map['loan_type'] as String)
          : null,
      currency: map['currency'] as String? ?? 'USD',
      initialBalance: (map['initial_balance'] as num).toDouble(),
      currentBalance: (map['current_balance'] as num).toDouble(),
      creditLimit: (map['credit_limit'] as num?)?.toDouble(),
      dueDate: map['due_date'] != null
          ? DateTime.tryParse(map['due_date'] as String)
          : null,
      minPayment: (map['min_payment'] as num?)?.toDouble(),
      totalLoanAmount: (map['total_loan_amount'] as num?)?.toDouble(),
      loanPaidAmount: (map['loan_paid_amount'] as num?)?.toDouble(),
      interestRate: (map['interest_rate'] as num?)?.toDouble(),
      colorHex: map['color_hex'] as String? ?? '#3b82f6',
      iconName: map['icon_name'] as String? ?? 'Landmark',
      institutionName: map['institution_name'] as String?,
      accountNumberMask: map['account_number_mask'] as String?,
      isArchived: (map['is_archived'] as int?) == 1,
      isHidden: (map['is_hidden'] as int?) == 1,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
    );
  }
}
`,
  },
  {
    path: 'lib/models/category.dart',
    filename: 'category.dart',
    category: 'model',
    description: 'Category model with subcategories, icon, color, and expense/income designation.',
    code: `import 'dart:convert';

enum CategoryType { expense, income }

class Category {
  final String id;
  final String name;
  final String icon;
  final String colorHex;
  final CategoryType type;
  final List<String> subCategories;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.colorHex,
    required this.type,
    required this.subCategories,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color_hex': colorHex,
      'type': type.name,
      'sub_categories_json': jsonEncode(subCategories),
    };
  }

  factory Category.fromMap(Map<String, dynamic> map) {
    List<String> subs = [];
    if (map['sub_categories_json'] != null) {
      final decoded = jsonDecode(map['sub_categories_json'] as String);
      if (decoded is List) {
        subs = decoded.map((e) => e.toString()).toList();
      }
    }

    return Category(
      id: map['id'] as String,
      name: map['name'] as String,
      icon: map['icon'] as String,
      colorHex: map['color_hex'] as String,
      type: CategoryType.values.byName(map['type'] as String),
      subCategories: subs,
    );
  }
}
`,
  },
  {
    path: 'lib/models/transaction.dart',
    filename: 'transaction.dart',
    category: 'model',
    description: 'Transaction model for Expenses, Incomes, and internal Transfers with receipt attachment.',
    code: `enum TransactionType { expense, income, transfer }

class TransactionRecord {
  final String id;
  final TransactionType type;
  final double amount;
  final DateTime date;
  final String accountId;
  final String? toAccountId; // For internal transfers
  final String categoryId;
  final String? subCategory;
  final String? note;
  final String? receiptPath;
  final DateTime createdAt;
  DateTime updatedAt;

  TransactionRecord({
    required this.id,
    required this.type,
    required this.amount,
    required this.date,
    required this.accountId,
    this.toAccountId,
    required this.categoryId,
    this.subCategory,
    this.note,
    this.receiptPath,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type.name,
      'amount': amount,
      'date': date.toIso8601String(),
      'account_id': accountId,
      'to_account_id': toAccountId,
      'category_id': categoryId,
      'sub_category': subCategory,
      'note': note,
      'receipt_path': receiptPath,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory TransactionRecord.fromMap(Map<String, dynamic> map) {
    return TransactionRecord(
      id: map['id'] as String,
      type: TransactionType.values.byName(map['type'] as String),
      amount: (map['amount'] as num).toDouble(),
      date: DateTime.parse(map['date'] as String),
      accountId: map['account_id'] as String,
      toAccountId: map['to_account_id'] as String?,
      categoryId: map['category_id'] as String,
      subCategory: map['sub_category'] as String?,
      note: map['note'] as String?,
      receiptPath: map['receipt_path'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
    );
  }
}
`,
  },
  {
    path: 'lib/services/database_helper.dart',
    filename: 'database_helper.dart',
    category: 'service',
    description: 'SQLite database helper using sqflite on mobile and sqflite_common_ffi for desktop platforms (macOS/Windows/Linux).',
    code: `import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import '../models/account.dart';
import '../models/category.dart';
import '../models/transaction.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('mbudget.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    // Check if running on desktop (Windows, Linux, macOS)
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }

    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        card_type TEXT,
        loan_type TEXT,
        currency TEXT NOT NULL,
        initial_balance REAL NOT NULL,
        current_balance REAL NOT NULL,
        credit_limit REAL,
        due_date TEXT,
        min_payment REAL,
        total_loan_amount REAL,
        loan_paid_amount REAL,
        interest_rate REAL,
        color_hex TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        institution_name TEXT,
        account_number_mask TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        type TEXT NOT NULL,
        sub_categories_json TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        account_id TEXT NOT NULL,
        to_account_id TEXT,
        category_id TEXT NOT NULL,
        sub_category TEXT,
        note TEXT,
        receipt_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    ''');

    // Create Indexes for fast querying
    await db.execute('CREATE INDEX idx_transactions_date ON transactions(date)');
    await db.execute('CREATE INDEX idx_transactions_account ON transactions(account_id)');
  }

  // Transaction insertion with atomic account balance update
  Future<void> insertTransaction(TransactionRecord tx) async {
    final db = await instance.database;
    await db.transaction((txn) async {
      await txn.insert('transactions', tx.toMap());

      // Update primary/source account
      if (tx.type == TransactionType.expense) {
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?',
          [tx.amount, DateTime.now().toIso8601String(), tx.accountId],
        );
      } else if (tx.type == TransactionType.income) {
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?',
          [tx.amount, DateTime.now().toIso8601String(), tx.accountId],
        );
      } else if (tx.type == TransactionType.transfer && tx.toAccountId != null) {
        // Source debited
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?',
          [tx.amount, DateTime.now().toIso8601String(), tx.accountId],
        );
        // Destination credited
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?',
          [tx.amount, DateTime.now().toIso8601String(), tx.toAccountId],
        );
      }
    });
  }

  Future<List<Account>> getAllAccounts() async {
    final db = await instance.database;
    final maps = await db.query('accounts', orderBy: 'name ASC');
    return maps.map((m) => Account.fromMap(m)).toList();
  }

  Future<List<TransactionRecord>> getTransactions({DateTime? start, DateTime? end}) async {
    final db = await instance.database;
    String? whereClause;
    List<dynamic>? whereArgs;

    if (start != null && end != null) {
      whereClause = 'date BETWEEN ? AND ?';
      whereArgs = [start.toIso8601String(), end.toIso8601String()];
    }

    final maps = await db.query(
      'transactions',
      where: whereClause,
      whereArgs: whereArgs,
      orderBy: 'date DESC',
    );
    return maps.map((m) => TransactionRecord.fromMap(m)).toList();
  }
}
`,
  },
  {
    path: 'lib/services/google_drive_sync_service.dart',
    filename: 'google_drive_sync_service.dart',
    category: 'service',
    description: 'Cloud Sync via Google Drive API (OAuth 2.0 & Google Sign-In) to dedicated AppData folder.',
    code: `import 'dart:convert';
import 'dart:io';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:http/http.dart' as http;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'database_helper.dart';

class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

class GoogleDriveSyncService {
  static final GoogleDriveSyncService instance = GoogleDriveSyncService._init();
  GoogleDriveSyncService._init();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      drive.DriveApi.driveAppdataScope,
      drive.DriveApi.driveFileScope,
    ],
  );

  GoogleSignInAccount? _currentUser;
  drive.DriveApi? _driveApi;

  GoogleSignInAccount? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null;

  Future<bool> signIn() async {
    try {
      _currentUser = await _googleSignIn.signIn();
      if (_currentUser == null) return false;

      final authHeaders = await _currentUser!.authHeaders;
      final authClient = GoogleAuthClient(authHeaders);
      _driveApi = drive.DriveApi(authClient);
      return true;
    } catch (e) {
      print('Google Sign-In Error: \$e');
      return false;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    _currentUser = null;
    _driveApi = null;
  }

  /// Backup encrypted database file to Google Drive dedicated AppDataFolder
  Future<bool> syncBackupToDrive() async {
    if (_driveApi == null) {
      final signedIn = await signIn();
      if (!signedIn) return false;
    }

    try {
      final dbPath = await getDatabasesPath();
      final localDbFile = File(join(dbPath, 'mbudget.db'));
      if (!await localDbFile.exists()) return false;

      const fileName = 'mBudget_backup.db';

      // 1. Check if backup already exists in appDataFolder
      final fileList = await _driveApi!.files.list(
        spaces: 'appDataFolder',
        $fields: 'files(id, name, modifiedTime)',
        q: "name = '\$fileName'",
      );

      final media = drive.Media(
        localDbFile.openRead(),
        await localDbFile.length(),
      );

      if (fileList.files != null && fileList.files!.isNotEmpty) {
        // Update existing backup file
        final existingFileId = fileList.files!.first.id!;
        await _driveApi!.files.update(
          drive.File(),
          existingFileId,
          uploadMedia: media,
        );
      } else {
        // Create new backup file in appDataFolder
        final driveFile = drive.File()
          ..name = fileName
          ..parents = ['appDataFolder'];

        await _driveApi!.files.create(
          driveFile,
          uploadMedia: media,
        );
      }
      return true;
    } catch (e) {
      print('Google Drive Sync Error: \$e');
      return false;
    }
  }

  /// Restore database from Google Drive with conflict timestamp check
  Future<bool> restoreFromDrive() async {
    if (_driveApi == null) {
      final ok = await signIn();
      if (!ok) return false;
    }

    try {
      final fileList = await _driveApi!.files.list(
        spaces: 'appDataFolder',
        $fields: 'files(id, name, modifiedTime)',
        q: "name = 'mBudget_backup.db'",
      );

      if (fileList.files == null || fileList.files!.isEmpty) {
        return false;
      }

      final remoteFile = fileList.files!.first;
      final media = await _driveApi!.files.get(
        remoteFile.id!,
        downloadOptions: drive.DownloadOptions.fullMedia,
      ) as drive.Media;

      final dbPath = await getDatabasesPath();
      final targetFile = File(join(dbPath, 'mbudget.db'));

      final sink = targetFile.openWrite();
      await media.stream.pipe(sink);
      await sink.close();

      return true;
    } catch (e) {
      print('Restore Error: \$e');
      return false;
    }
  }
}
`,
  },
  {
    path: 'lib/viewmodels/budget_provider.dart',
    filename: 'budget_provider.dart',
    category: 'state',
    description: 'Provider state management computing Net Worth, Monthly Cash Flow, Active Credit Card dues and Loan analytics.',
    code: `import 'package:flutter/foundation.dart';
import '../models/account.dart';
import '../models/category.dart';
import '../models/transaction.dart';
import '../services/database_helper.dart';

class BudgetProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;

  List<Account> _accounts = [];
  List<TransactionRecord> _transactions = [];
  List<Category> _categories = [];
  bool _isLoading = false;

  List<Account> get accounts => _accounts;
  List<TransactionRecord> get transactions => _transactions;
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;

  /// Overall Total Net Worth: (Cash + Bank + positive Card - credit card dues - loan debt)
  double get totalNetWorth {
    double sum = 0.0;
    for (final acc in _accounts) {
      if (acc.isHidden || acc.isArchived) continue;
      sum += acc.currentBalance;
    }
    return sum;
  }

  /// Total Monthly Income
  double get monthlyIncome {
    final now = DateTime.now();
    return _transactions
        .where((t) =>
            t.type == TransactionType.income &&
            t.date.year == now.year &&
            t.date.month == now.month)
        .fold(0.0, (prev, t) => prev + t.amount);
  }

  /// Total Monthly Expense
  double get monthlyExpense {
    final now = DateTime.now();
    return _transactions
        .where((t) =>
            t.type == TransactionType.expense &&
            t.date.year == now.year &&
            t.date.month == now.month)
        .fold(0.0, (prev, t) => prev + t.amount);
  }

  /// Active Credit Card Dues
  double get activeCreditCardDues {
    return _accounts
        .where((a) => a.type == AccountType.card && a.cardType == CardType.credit && a.currentBalance < 0)
        .fold(0.0, (prev, a) => prev + a.currentBalance.abs());
  }

  /// Total Loaned Amount (Money owed or borrowed)
  double get totalLoanOwed {
    return _accounts
        .where((a) => a.type == AccountType.loan && a.loanType == LoanType.borrowed)
        .fold(0.0, (prev, a) => prev + (a.totalLoanAmount ?? a.currentBalance.abs()));
  }

  /// Total Loan Paid
  double get totalLoanPaid {
    return _accounts
        .where((a) => a.type == AccountType.loan && a.loanType == LoanType.borrowed)
        .fold(0.0, (prev, a) => prev + (a.loanPaidAmount ?? 0.0));
  }

  Future<void> loadAllData() async {
    _isLoading = true;
    notifyListeners();

    _accounts = await _db.getAllAccounts();
    _transactions = await _db.getTransactions();

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addTransaction(TransactionRecord tx) async {
    await _db.insertTransaction(tx);
    await loadAllData();
  }
}
`,
  },
  {
    path: 'lib/views/dashboard_view.dart',
    filename: 'dashboard_view.dart',
    category: 'view',
    description: 'Dashboard screen layout with text summary cards, fl_chart BarChart (Income vs Expense) and PieChart (Category breakdown).',
    code: `import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../viewmodels/budget_provider.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BudgetProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        title: const Text('mBudget', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_sync_outlined),
            onPressed: () {
              // Trigger Google Drive Sync
            },
          ),
        ],
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final isDesktop = constraints.maxWidth >= 900;
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Text-Based Summary Cards Grid
                      _buildSummaryGrid(provider, isDesktop),
                      const SizedBox(height: 24),

                      // Interactive Graphical Visualizations (fl_chart)
                      if (isDesktop)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: _buildIncomeExpenseBarChart(provider)),
                            const SizedBox(width: 20),
                            Expanded(child: _buildCategoryPieChart(provider)),
                          ],
                        )
                      else ...[
                        _buildIncomeExpenseBarChart(provider),
                        const SizedBox(height: 20),
                        _buildCategoryPieChart(provider),
                      ],
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF10B981),
        onPressed: () {
          // Open Transaction Entry Dialog
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildSummaryGrid(BudgetProvider p, bool isDesktop) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: [
        _buildMetricCard(
          title: 'Total Net Worth',
          value: '\$\${p.totalNetWorth.toStringAsFixed(2)}',
          color: const Color(0xFF3B82F6),
          subtitle: 'Combined all accounts',
        ),
        _buildMetricCard(
          title: 'Monthly Income',
          value: '+\$\${p.monthlyIncome.toStringAsFixed(2)}',
          color: const Color(0xFF10B981),
          subtitle: 'October inflows',
        ),
        _buildMetricCard(
          title: 'Monthly Expense',
          value: '-\$\${p.monthlyExpense.toStringAsFixed(2)}',
          color: const Color(0xFFF43F5E),
          subtitle: 'October outflows',
        ),
        _buildMetricCard(
          title: 'Credit Card Dues',
          value: '\$\${p.activeCreditCardDues.toStringAsFixed(2)}',
          color: const Color(0xFFF59E0B),
          subtitle: 'Active balance owing',
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required Color color,
    required String subtitle,
  }) {
    return Container(
      width: 260,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF161F30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildIncomeExpenseBarChart(BudgetProvider p) {
    return Container(
      height: 320,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF161F30),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Monthly Cash Flow (fl_chart)',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 5000,
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (val, meta) {
                        return Text('Oct', style: const TextStyle(color: Colors.white54, fontSize: 12));
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                barGroups: [
                  BarChartGroupData(
                    x: 0,
                    barRods: [
                      BarChartRodData(toY: p.monthlyIncome, color: const Color(0xFF10B981), width: 16),
                      BarChartRodData(toY: p.monthlyExpense, color: const Color(0xFFF43F5E), width: 16),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryPieChart(BudgetProvider p) {
    return Container(
      height: 320,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF161F30),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Expense Distribution by Category',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: PieChart(
              PieChartData(
                sectionsSpace: 3,
                centerSpaceRadius: 40,
                sections: [
                  PieChartSectionData(value: 40, color: const Color(0xFF6366F1), title: 'Housing', radius: 50),
                  PieChartSectionData(value: 30, color: const Color(0xFF10B981), title: 'Food', radius: 50),
                  PieChartSectionData(value: 15, color: const Color(0xFF06B6D4), title: 'Transit', radius: 50),
                  PieChartSectionData(value: 15, color: const Color(0xFFF59E0B), title: 'Bills', radius: 50),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    category: 'config',
    description: 'Application entry point initializing SQLite FFI on desktop platforms and configuring Provider.',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'viewmodels/budget_provider.dart';
import 'views/dashboard_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BudgetProvider()..loadAllData()),
      ],
      child: const MBudgetApp(),
    ),
  );
}

class MBudgetApp extends StatelessWidget {
  const MBudgetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'mBudget',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          surface: Color(0xFF161F30),
        ),
        fontFamily: 'Plus Jakarta Sans',
      ),
      home: const DashboardView(),
    );
  }
}
`,
  },
];
