import 'package:flutter/material.dart';
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
