import 'package:flutter/material.dart';

// Page displaying a resume's version history as a scrollable list.
class ApplicationPage extends StatefulWidget {
  const ApplicationPage({super.key});

  @override
  State<ApplicationPage> createState() => _ApplicationPage();
}

class _ApplicationPage extends State<ApplicationPage> {
  String text = "Test";

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

            const SizedBox(height: 50),

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

                    // Red header bar with section title
                    Container(
                      height: 40,
                      width: 320,
                      decoration: const BoxDecoration(
                        color: Color.fromARGB(255, 139, 0, 0),
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(12),
                        ),
                      ),
                      child: const Padding(
                        padding: EdgeInsets.only(left: 15),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Version History",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ),

                    // Scrollable list of version entries
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: 6, // TODO: replace with real version count
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Container(
                              height: 36,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.grey[900],
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Column(
                                children: [

                                  // Top bevel highlight
                                  Container(
                                    height: 1,
                                    decoration: const BoxDecoration(
                                      color: Colors.white24,
                                      borderRadius: BorderRadius.vertical(
                                        top: Radius.circular(6),
                                      ),
                                    ),
                                  ),

                                  // Version label
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                      child: Align(
                                        alignment: Alignment.centerLeft,
                                        child: Text(
                                          "Version $index", // TODO: replace with real version name
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),

                                  // Bottom bevel shadow
                                  Container(
                                    height: 1,
                                    decoration: const BoxDecoration(
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
                    ),

                  ],
                ),
              ),
            ),

          ],
        ),
      ),
    );
  }
}