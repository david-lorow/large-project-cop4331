import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/loginAndRegister.dart';
import 'pages/login.dart';
import 'pages/register.dart';
import 'pages/resume.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
  final token = prefs.getString('token');

  // ✅ If flagged as logged in but no token exists, treat as logged out
  final shouldGoToResume = isLoggedIn && token != null && token.isNotEmpty;

  runApp(MyApp(isLoggedIn: shouldGoToResume));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Resume Reaper',
      theme: ThemeData.dark(),
      initialRoute: isLoggedIn ? '/resume' : '/loginAndRegister',
      routes: {
        '/loginAndRegister': (context) => const LoginOrRegister(),
        '/login':            (context) => const LoginPage(),
        '/register':         (context) => const RegisterPage(),
        '/resume':           (context) => const ResumePage(),
      },
    );
  }
}