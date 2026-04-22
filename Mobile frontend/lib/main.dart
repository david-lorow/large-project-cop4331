import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/loginAndRegister.dart';
import 'pages/login.dart';
import 'pages/register.dart';
import 'pages/resume.dart';
import 'pages/application.dart';

// Entry point — checks SharedPreferences to determine if the user is already
// logged in, then launches the app at the appropriate initial route.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs     = await SharedPreferences.getInstance();
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

  runApp(MyApp(isLoggedIn: isLoggedIn));
}


// Root widget of the application.
// Receives the login state from main() to set the correct initial route.
class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Resume Reaper',
      theme: ThemeData.dark(),

      // Send logged-in users straight to the resume page, others to login/register
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




