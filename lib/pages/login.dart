import 'package:flutter/material.dart';
import 'package:team24/services/loginAndRegisterService.dart';

// Controllers are kept at the top level so they persist across rebuilds.
final TextEditingController emailController    = TextEditingController();
final TextEditingController passwordController = TextEditingController();

// Page where an existing user can sign in with their email and password.
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPage();
}

class _LoginPage extends State<LoginPage> {
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [

            // App logo
            Image.asset('assets/images/reaper.png'),

            // Page title
            const Padding(
              padding: EdgeInsets.fromLTRB(30, 10, 30, 0),
              child: Text(
                "Sign in",
                style: TextStyle(fontSize: 25, color: Colors.white),
              ),
            ),

            // Decorative divider
            const Padding(
              padding: EdgeInsets.fromLTRB(90, 0, 90, 10),
              child: Divider(color: Color.fromARGB(255, 139, 0, 0), height: 0),
            ),

            // Email label
            const Padding(
              padding: EdgeInsets.fromLTRB(30, 0, 30, 5),
              child: Text(
                "Email",
                style: TextStyle(fontSize: 20, color: Colors.white),
              ),
            ),

            // Email input field
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: emailController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  hintText: 'Email',
                ),
              ),
            ),

            // Password label
            const Padding(
              padding: EdgeInsets.fromLTRB(30, 15, 30, 5),
              child: Text(
                "Password",
                style: TextStyle(fontSize: 20, color: Colors.white),
              ),
            ),

            // Password input field
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: passwordController,
                textAlign: TextAlign.center,
                obscureText: true, // hides password characters
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 50),
                  filled: true,
                  fillColor: const Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  hintText: 'Password',
                ),
              ),
            ),

            // Submit button — calls loginUser and navigates on success
            Padding(
              padding: const EdgeInsets.fromLTRB(30, 30, 30, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 50),
                  backgroundColor: const Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: () async {
                  final email    = emailController.text;
                  final password = passwordController.text;

                  final result = await loginUser(email, password, context);

                  if (result) {
                    await saveLoginState();
                    Navigator.pushNamed(context, '/resume');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Login failed. Please try again.'),
                      ),
                    );
                  }
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