import 'dart:io';
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
    // Cross-platform SQLite initialization for desktop (Windows, Linux, macOS)
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

    await db.execute('CREATE INDEX idx_transactions_date ON transactions(date)');
    await db.execute('CREATE INDEX idx_transactions_account ON transactions(account_id)');
  }

  Future<void> insertTransaction(TransactionRecord tx) async {
    final db = await instance.database;
    await db.transaction((txn) async {
      await txn.insert('transactions', tx.toMap());

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
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?',
          [tx.amount, DateTime.now().toIso8601String(), tx.accountId],
        );
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
