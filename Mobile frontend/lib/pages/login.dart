import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:team24/services/loginAndRegisterService.dart';

final TextEditingController emailController = TextEditingController();
final TextEditingController passwordController = TextEditingController();


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
            style: TextStyle(color: Colors.white, fontSize: 32),
            children: [
              TextSpan(
                text: '\n Reaper',
                style: TextStyle(color: Color.fromARGB(255, 139, 0, 0), fontSize: 32),
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
            Image.asset('assets/images/reaper.png'), //Image asset
            
            
            Padding( //Holds the sign in text
              padding: EdgeInsetsGeometry.fromLTRB(30, 10, 30, 0),
              child: Text("Sign in", 
              style: TextStyle(fontSize: 25, color: Colors.white)),
            ),
            
            Padding( //Manages the line
              padding: EdgeInsetsGeometry.fromLTRB(90, 0, 90, 10),
              child: Divider(color: Color.fromARGB(255, 139, 0, 0), height: 0)

            ),



            Padding( //Holds the username text
              padding: EdgeInsetsGeometry.fromLTRB(30, 0, 30, 5),
              child: Text("Email", 
              style: TextStyle(fontSize: 20, color: Colors.white)),
            ),
            
            Padding( //Manages the email text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: emailController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'Email',
              )
            ),
            ),
            

            Padding( //Holds the password text
              padding: EdgeInsetsGeometry.fromLTRB(30, 15, 30, 5),
              child: Text("Password", 
              style: TextStyle(fontSize: 20, color: Colors.white)),
            ),
            
            Padding( //Manages the password text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: passwordController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'Password',
              )
            ),
            ),
            
          
            Padding(
              padding: EdgeInsetsGeometry.fromLTRB(30, 30, 30, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 50),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Submit'),
                onPressed: () async { 
                  final email = emailController.text;
                  final password = passwordController.text;

                  bool result = await loginUser(email, password, context);

                  if (result == true)
                  {
                    await saveLoginState();
                    Navigator.pushNamed(context, '/resume');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar
                    (
                      const SnackBar
                      (
                        content: Text('Login failed. Please try again.'),
                      ),
                    );
                  }
                }
                )
            )


          ],
        ),
      ),
     
    );
  }
}
