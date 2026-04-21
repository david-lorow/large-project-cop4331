import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:team24/api/api_client.dart';

final TextEditingController emailController = TextEditingController();
final TextEditingController passwordController = TextEditingController();
final TextEditingController firstController = TextEditingController();
final TextEditingController lastController = TextEditingController();
final TextEditingController usernameController = TextEditingController();





Future<void> saveLoginState() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('isLoggedIn', true);
}


Future<bool> registerUser(String username, String firstName, String lastName, String email, String password, BuildContext context) async {
  final url = ApiClient.register(); // Replace with your API endpoint

 try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      // Success
      final data = jsonDecode(response.body);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    print('Request failed: $e');
    return false;
  }
}




Future<bool> loginUser(String email, String password, BuildContext context) async {
  final url = ApiClient.login();

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      // Success
      final data = jsonDecode(response.body);
      final token = data['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('token', token);
      await prefs.setBool('isLoggedIn', true);



      return true;
    } else {
      final data = jsonDecode(response.body);
            print(response.body);
     return false;
    }
  } catch (e) {
    print('Request failed: $e');
    return false;
  }
}


Future<void> logout() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('isLoggedIn', false);
}
