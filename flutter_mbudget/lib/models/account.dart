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
