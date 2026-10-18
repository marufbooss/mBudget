import 'package:flutter/foundation.dart';
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

  double get totalNetWorth {
    double sum = 0.0;
    for (final acc in _accounts) {
      if (acc.isHidden || acc.isArchived) continue;
      sum += acc.currentBalance;
    }
    return sum;
  }

  double get monthlyIncome {
    final now = DateTime.now();
    return _transactions
        .where((t) =>
            t.type == TransactionType.income &&
            t.date.year == now.year &&
            t.date.month == now.month)
        .fold(0.0, (prev, t) => prev + t.amount);
  }

  double get monthlyExpense {
    final now = DateTime.now();
    return _transactions
        .where((t) =>
            t.type == TransactionType.expense &&
            t.date.year == now.year &&
            t.date.month == now.month)
        .fold(0.0, (prev, t) => prev + t.amount);
  }

  double get activeCreditCardDues {
    return _accounts
        .where((a) => a.type == AccountType.card && a.cardType == CardType.credit && a.currentBalance < 0)
        .fold(0.0, (prev, a) => prev + a.currentBalance.abs());
  }

  double get totalLoanOwed {
    return _accounts
        .where((a) => a.type == AccountType.loan && a.loanType == LoanType.borrowed)
        .fold(0.0, (prev, a) => prev + (a.totalLoanAmount ?? a.currentBalance.abs()));
  }

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
