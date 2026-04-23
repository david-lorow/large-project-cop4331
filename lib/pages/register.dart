import 'package:flutter/material.dart';
import 'package:team24/services/loginAndRegisterService.dart';

// Page where a new user can create an account.
class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPage();
}

class _RegisterPage extends State<RegisterPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        toolbarHeight: 75,
        backgroundColor: Colors.black,
        title: Text.rich(
          TextSpan(
            text: 'Resume ',
            style: const TextStyle(color: Colors.white, fontSize: 32),
            children: [
              TextSpan(
                text: '\n Reaper',
                style: const TextStyle(
                  color: Color.fromARGB(255, 139, 0, 0),
                  fontSize: 32,
                ),
              ),
            ],
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [

            // App logo
            Image.asset('assets/images/reaper.png'),

            // Page title
            const Padding(
              padding: EdgeInsets.fromLTRB(30, 10, 30, 0),
              child: Text(
                "Create a User",
                style: TextStyle(fontSize: 25, color: Colors.white),
              ),
            ),

            // Decorative divider
            const Padding(
              padding: EdgeInsets.fromLTRB(90, 0, 90, 10),
              child: Divider(color: Color.fromARGB(255, 139, 0, 0), height: 0),
            ),

            // First name input
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: firstController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  hintText: 'First Name',
                ),
              ),
            ),

            // Last name input
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: lastController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  hintText: 'Last Name',
                ),
              ),
            ),

            // Email input
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: emailController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  hintText: 'Email',
                ),
              ),
            ),

            // Username input
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: usernameController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  hintText: 'Username',
                ),
              ),
            ),

            // Password input
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: passwordController,
                textAlign: TextAlign.center,
                obscureText: true, // hides password characters
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  hintText: 'Password',
                ),
              ),
            ),

            // Submit button — calls registerUser and shows confirmation snackbar
            Padding(
              padding: const EdgeInsets.fromLTRB(30, 15, 30, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 50),
                  backgroundColor: const Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: () {
                  registerUser(
                    usernameController.text,
                    firstController.text,
                    lastController.text,
                    emailController.text,
                    passwordController.text,
                    context,
                  );
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Registration successful! Please validate your email, then sign in.',
                      ),
                    ),
                  );
                },
                child: const Text('Submit'),
              ),
            ),

          ],
        ),
      ),
    );
  }
}