import 'dart:ui';
import 'package:flutter/material.dart';
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
            tooltip: 'Sync with Google Drive',
            onPressed: () {},
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
                      _buildSummaryGrid(provider, isDesktop),
                      const SizedBox(height: 24),
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
        onPressed: () {},
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
          value: '\$${p.totalNetWorth.toStringAsFixed(2)}',
          color: const Color(0xFF3B82F6),
          subtitle: 'Combined all accounts',
        ),
        _buildMetricCard(
          title: 'Monthly Income',
          value: '+\$${p.monthlyIncome.toStringAsFixed(2)}',
          color: const Color(0xFF10B981),
          subtitle: 'October inflows',
        ),
        _buildMetricCard(
          title: 'Monthly Expense',
          value: '-\$${p.monthlyExpense.toStringAsFixed(2)}',
          color: const Color(0xFFF43F5E),
          subtitle: 'October outflows',
        ),
        _buildMetricCard(
          title: 'Credit Card Dues',
          value: '\$${p.activeCreditCardDues.toStringAsFixed(2)}',
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
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
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
