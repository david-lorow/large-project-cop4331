import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:team24/api/api_client.dart';

// Controllers are defined globally so they can be shared across login/register pages.
final TextEditingController emailController    = TextEditingController();
final TextEditingController passwordController = TextEditingController();
final TextEditingController firstController    = TextEditingController();
final TextEditingController lastController     = TextEditingController();
final TextEditingController usernameController = TextEditingController();


// Persists the logged-in state to SharedPreferences.
Future<void> saveLoginState() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('isLoggedIn', true);
}


// Sends a POST request to register a new user.
// Returns true on success, false on failure.
Future<bool> registerUser(
  String username,
  String firstName,
  String lastName,
  String email,
  String password,
  BuildContext context,
) async {
  final url = ApiClient.register();

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName':  lastName,
        'username':  username,
        'email':     email,
        'password':  password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    } else {
      print("Register failed: ${response.body}");
      return false;
    }
  } catch (e) {
    print('Register request failed: $e');
    return false;
  }
}


// Sends a POST request to log in an existing user.
// On success, saves the JWT token and login state to SharedPreferences.
// Returns true on success, false on failure.
Future<bool> loginUser(
  String email,
  String password,
  BuildContext context,
) async {
  final url = ApiClient.login();

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email':    email,
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data  = jsonDecode(response.body);
      final token = data['token'];

      // Persist auth token and login flag for session continuity
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setBool('isLoggedIn', true);

      return true;
    } else {
      print("Login failed: ${response.body}");
      return false;
    }
  } catch (e) {
    print('Login request failed: $e');
    return false;
  }
}


// Clears the logged-in state from SharedPreferences.
Future<void> logout() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('isLoggedIn', false);
}