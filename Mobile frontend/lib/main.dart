import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'pages/loginAndRegister.dart';
import 'pages/login.dart';
import 'pages/register.dart';
import 'pages/resume.dart';
import 'pages/application.dart';
import 'package:shared_preferences/shared_preferences.dart';





 
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

  runApp(MyApp(isLoggedIn: isLoggedIn));
}




class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'Flutter Demo',
      theme: ThemeData.dark(
      ),

      initialRoute: isLoggedIn ? '/resume' : '/loginAndRegister',
      routes: {
        '/loginAndRegister': (context) => LoginOrRegister(),
        '/login': (context) => LoginPage(),
        '/register': (context) => RegisterPage(),
        '/resume': (context) => ResumePage(),
        '/application': (context) => ApplicationPage(),
      }

    );
  }
}








