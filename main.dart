import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

final TextEditingController emailController = TextEditingController();
final TextEditingController passwordController = TextEditingController();
final TextEditingController firstController = TextEditingController();
final TextEditingController lastController = TextEditingController();
final TextEditingController usernameController = TextEditingController();



Future<void> registerUser(String username, String firstName, String lastName, String email, String password, BuildContext context) async {
  final url = Uri.parse('http://45.55.57.119:6767/api/auth/register'); // Replace with your API endpoint


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
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Success'),
          content: Text('Registration Success!'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('close'),
            ), 
          ],
        ),
      );
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Fail'),
          content: Text('Registration failed: ${response.statusCode}'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('close'),
            ), 
          ],
        ),
      );
    }
  } catch (e) {
    print('Request failed: $e');
  }
}


Future<void> loginUser(String email, String password, BuildContext context) async {
  final url = Uri.parse('http://45.55.57.119:6767/api/auth/login'); // Replace with your API endpoint


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

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Success'),
          content: Text('Login Successfull'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Close'),
            ), 
          ],
        ),
      );


    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Success'),
          content: Text('login failed: ${response.statusCode}'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('close'),
            ), 
          ],
        ),
      );
    }
  } catch (e) {
    print('Request failed: $e');
  }
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData.dark(
      ),
      home: const ResumePage(title: ''),
    );
  }
}


class LoginOrRegister extends StatelessWidget {
  const LoginOrRegister({super.key, required this.title});
  final String title;
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
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => MyHomePage(title: title))
                  );
                },
                child: const Text('Sign in'),
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
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => RegisterPage(title: title))
                  );
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

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".
  

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}


class _MyHomePageState extends State<MyHomePage> {


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
            
            Padding( //Manages the email text box
              padding: EdgeInsetsGeometry.fromLTRB(50, 5, 50, 0),
              child: TextField(
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
                onPressed: () { 
                  final email = emailController.text;
                  final password = passwordController.text;

                  loginUser(email, password, context);

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



class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".
  

  final String title;

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




class ResumePage extends StatefulWidget {
  const ResumePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".
  

  final String title;

  @override
  State<ResumePage> createState() => _ResumePage();
}


class _ResumePage extends State<ResumePage> {
String text = "Test";

void changeText() {
  setState(() {
    text = "Text changed";



  });
}

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


            Padding(
              padding: EdgeInsetsGeometry.fromLTRB(30, 15, 30, 0),
              child: SizedBox(
                height: 500,
              child: PageView(
                onPageChanged: (index) {
                  setState(() {
                      text = "You are on page $index";
                    });
                },
                children: [
                  Container(
                    width: 416,
                    height: 500,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.grey,
                    ),
                    
                  ),
                  Container(
                    width: 416,
                    height: 500,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.red,
                    ),
                    
                  ),
                ]
              ),
              ),
            ),


          Text(text),




            Padding(
              padding: EdgeInsetsGeometry.fromLTRB(0, 120, 0, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(175, 70),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: ()
                {
                  
                },
                child: const Text('View Applications'),
              ),


              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(175, 70),
                  backgroundColor: Color.fromARGB(255, 139, 0, 0),
                  foregroundColor: Colors.white,
                ),
                onPressed: ()
                {
                  
                },
                child: const Text('Configure'),
              ),

                ],
              )
              
            ),


          ],
        ),
      ),
     
    );
  }
}


