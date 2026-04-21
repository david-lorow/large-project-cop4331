import 'dart:convert';
import 'package:flutter/material.dart';
import 'dart:io';
import 'package:http/http.dart';

import 'package:http/http.dart' as http;
import '../models/resume.dart';
import '../api/api_client.dart';
import 'package:file_picker/file_picker.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:http_parser/http_parser.dart';



Future<String?> getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}


Future<void> pickAndUpload(String title) async {
  FilePickerResult? result = await FilePicker.platform.pickFiles(
    type: FileType.custom,
    allowedExtensions: ['pdf'],
  );

  if (result == null || result.files.single.path == null) {
    print("No file selected");
    return;
  }

  File file = File(result.files.single.path!);
  print("FILE PATH: ${file.path}");
  await uploadPDF(file, "Testing");
}



Future<void> uploadPDF(File file, String title) async {
  var url = ApiClient.uploadResumes();
  final token = await getToken(); // make sure this works

  var request = http.MultipartRequest("POST", url);

  request.fields['title'] = title;

  request.files.add(
    await http.MultipartFile.fromPath(
      'resume',
      file.path,
      contentType: MediaType('application', 'pdf'),
    ),
  );

  if (token != null && token.isNotEmpty) {
    request.headers['Authorization'] = 'Bearer $token';
  }


  var response = await request.send();
  var responseBody = await response.stream.bytesToString();

  print("Status: ${response.statusCode}");
  print("Body: $responseBody");



  if (response.statusCode == 200 || response.statusCode == 201)
  {
    print("Upload success");
  }
  else {
    print("Upload Failure");
  }
}

class ResumeService {
  static Future<List<Resume>> listResumes() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');



    final response = await http.get(
    ApiClient.listResume(),
    headers: {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    },
  );

    if (response.statusCode != 200) {
      print("Status: ${response.body}");
      throw Exception("Failed to load resumes");
    }

    print(response.statusCode);
print(response.body);

    final data = jsonDecode(response.body);

    return (data['resumes'] as List)
        .map((json) => Resume.fromJson(json))
        .toList();
  }









  
}


void showResumeActions(BuildContext context, File? file) {
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.shuffle),
                label: const Text("Select Version"),
                onPressed: () async {

                  pickAndUpload("First Resume");
                  Navigator.pop(context);

                 // if (file != null) {
                  //  await uploadPDF(file, "test");
                 // } else {
                 //   print("No file selected");
                 // }
                },
              ),
            ),

            const SizedBox(height: 10),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.upload_file),
                label: const Text("Add Version"),
                onPressed: () {
                  Navigator.pop(context);
                  print("View resume");
                },
              ),
            ),

            const SizedBox(height: 10),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.delete),
                label: const Text("Delete Resume"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                ),
                onPressed: () {
                  Navigator.pop(context);
                  print("Delete resume");
                },
              ),
            ),
          ],
        ),
      );
    },
  );
}