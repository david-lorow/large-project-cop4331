import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:team24/services/loginAndRegisterService.dart';


final TextEditingController emailController = TextEditingController();
final TextEditingController passwordController = TextEditingController();
final TextEditingController firstController = TextEditingController();
final TextEditingController lastController = TextEditingController();
final TextEditingController usernameController = TextEditingController();



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
        physics: AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Image.asset('assets/images/reaper.png'), //Image asset
            
            Padding( //Holds the sign in text
              padding: EdgeInsetsGeometry.fromLTRB(30, 10, 30, 0),
              child: Text("Create a User", 
              style: TextStyle(fontSize: 25, color: Colors.white)),
            ),
            
            Padding( //Manages the line
              padding: EdgeInsetsGeometry.fromLTRB(90, 0, 90, 10),
              child: Divider(color: Color.fromARGB(255, 139, 0, 0), height: 0)

            ),


            
            Padding( //Manages the first text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: firstController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'First Name',
              )
            ),
            ),
            
            
            Padding( //Manages the last text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: lastController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'last Name',
              )
            ),
            ),



    Padding( //Manages the email text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: emailController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'email',
              )
            ),
            ),



            Padding( //Manages the email text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: usernameController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 50),
                  filled: true,
                  fillColor: Color.fromARGB(82, 217, 217, 217),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'username',
              )
            ),
            ),


            
            Padding( //Manages the email text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
                controller: passwordController,
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 50),
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
              padding: EdgeInsetsGeometry.fromLTRB(30, 15, 30, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(300, 50),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: () { 
                  final firstName = firstController.text;
                  final lastName = lastController.text;
                  final email = emailController.text;
                  final username = usernameController.text;
                  final password = passwordController.text;


                  registerUser(username, firstName, lastName, email, password, context);
                  ScaffoldMessenger.of(context).showSnackBar
                    (
                      const SnackBar
                      (
                        content: Text('Registration Successful, please validate your email, then sign in.'),
                      ),
                    );

                },
                child: const Text('Submit'),
              )
            )


          ],
        ),
      ),
     
    );
  }
}
