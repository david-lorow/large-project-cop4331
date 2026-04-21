import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// APPLICATION PAGE


class ApplicationPage extends StatefulWidget {
  const ApplicationPage({super.key});



  @override
  State<ApplicationPage> createState() => _ApplicationPage();
}


class _ApplicationPage extends State<ApplicationPage> {
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







            Column(
  children: [
    SizedBox(height: 50), // adjust this value
    Center(
      child: Container(
        width: 320,
        height: 500,
        decoration: BoxDecoration(
          color: Colors.grey,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Container(

              height: 40,
              width: 320,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                color: Color.fromARGB(255, 139, 0, 0),
              ),
              child: Padding(
                padding: EdgeInsets.only(left: 15),
                child: Align(
                  alignment: Alignment.centerLeft,

              
              child: Text("Version History",
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.left,
              
              ),
                ),
              ),
            ),




            Expanded(
  child: ListView.builder(
    padding: EdgeInsets.all(12),
    itemCount: 6,
    itemBuilder: (context, index) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: 4),
        child: Container(
          height: 36, // thin button
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.grey[900],
            borderRadius: BorderRadius.circular(6),
          ),
          child: Column(
            children: [
              // top bevel highlight
              Container(
                height: 1,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(6),
                  ),
                ),
              ),

              // button content
              Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Button $index",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),

              // bottom bevel shadow
              Container(
                height: 1,
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(6),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  ),
)


          ],
        ),
      ),
    ),
  ],
)

            




          ],
        ),
      ),
     
    );
  }
}
