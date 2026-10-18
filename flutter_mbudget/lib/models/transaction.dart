enum TransactionType { expense, income, transfer }

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
