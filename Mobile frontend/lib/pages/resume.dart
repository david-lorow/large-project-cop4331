import 'package:flutter/material.dart';
import 'package:team24/models/resume.dart';
import 'package:team24/services/resumeLists.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Main resume page — displays the user's resumes in a swipeable page view.
class ResumePage extends StatefulWidget {
  const ResumePage({super.key});

  @override
  State<ResumePage> createState() => _ResumePage();
}

class _ResumePage extends State<ResumePage> {
  String text = "Test";
  List<Resume> resumes = [];

  @override
  void initState() {
    super.initState();
    loadResumes();
  }

  // Fetches the user's resumes from the API and updates state.
  Future<void> loadResumes() async {
    final data = await ResumeService.listResumes();

    if (data.isNotEmpty) {
      print("ID: ${data.first.id}");
      print("Name: ${data.first.name}");
    } else {
      print("No resumes found");
    }

    setState(() {
      resumes = data;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        // Logout button — prompts confirmation before clearing session
        leading: IconButton(
          icon: const Icon(Icons.logout),
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) {
                return AlertDialog(
                  title: const Text("Are you sure you want to log out?"),
                  actions: [

                    // Cancel — close dialog with no action
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text("No"),
                    ),

                    // Confirm — clear session data and return to login screen
                    TextButton(
                      onPressed: () async {
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setBool('isLoggedIn', false);
                        await prefs.remove('token');

                        Navigator.pop(context);
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          '/loginAndRegister',
                          (route) => false,
                        );
                      },
                      child: const Text("Yes"),
                    ),

                  ],
                );
              },
            );
          },
        ),
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

            // Swipeable resume thumbnail viewer
            Padding(
              padding: const EdgeInsets.fromLTRB(30, 15, 30, 0),
              child: SizedBox(
                height: 500,
                child: PageView.builder(
                  itemCount: resumes.length,
                  onPageChanged: (index) {
                    setState(() {
                      text = "You are on page $index";
                    });
                  },
                  itemBuilder: (context, index) {
                    final resume = resumes[index];
                    return Container(
                      width: 416,
                      height: 500,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.grey,
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          resume.thumbnailUrl,
                          fit: BoxFit.cover,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Debug/status text
            Text(text),
            Text("Resumes: ${resumes.length}"),

            // Action buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(0, 120, 0, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [

                  // Navigates to the applications page
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(175, 70),
                      backgroundColor: const Color.fromARGB(255, 139, 0, 0),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.pushNamed(context, '/application'),
                    child: const Text('View Applications'),
                  ),

                  // Opens the resume options dialog (upload, select version, delete)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(175, 70),
                      backgroundColor: const Color.fromARGB(255, 139, 0, 0),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => showResumeActions(context, null),
                    child: const Text("Resume Options"),
                  ),

                ],
              ),
            ),

          ],
        ),
      ),
    );
  }
}