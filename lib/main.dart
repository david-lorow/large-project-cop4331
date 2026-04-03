import 'package:flutter/material.dart';

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
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
      ),
      home: const LoginOrRegister(title: ''),
    );
  }
}


class LoginOrRegister extends StatelessWidget {
  const LoginOrRegister({super.key, required this.title});
  final String title;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 110,
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
      body: Center(
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
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 110,
        // TRY THIS: Try changing the color here to a specific color (to
        // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
        // change color while the other colors stay the same.
        backgroundColor: Colors.black,
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
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
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          //
          // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
          // action in the IDE, or press "p" in the console), to see the
          // wireframe for each widget.
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
              child: Text("Username", 
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
                onPressed: () { print("Button Pressed!"); },
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
      appBar: AppBar(
        toolbarHeight: 110,
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
      body: Center(
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



            Padding( //Holds the username text
              padding: EdgeInsetsGeometry.fromLTRB(30, 0, 30, 5),
              child: Text("Username", 
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
                onPressed: () { print("Button Pressed!"); },
                child: const Text('Submit'),
              )
            )


          ],
        ),
      ),
     
    );
  }
}





