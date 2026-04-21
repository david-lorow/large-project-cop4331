import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';





class LoginOrRegister extends StatelessWidget {
  const LoginOrRegister({super.key});
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
            
            
            Padding(
              padding: EdgeInsetsGeometry.fromLTRB(50, 50, 50, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(400, 50),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: () { 
                  Navigator.pushNamed(context, '/login');
                },
                child: const Text('Sign in')
              )
            ),



            Padding(
              padding: EdgeInsetsGeometry.fromLTRB(50, 50, 50, 0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(400, 50),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: () { 
                  Navigator.pushNamed(context, '/register');
                },
                child: const Text('Register'),
              )
            )

          ],
        ),
    )
    );
  }
}




