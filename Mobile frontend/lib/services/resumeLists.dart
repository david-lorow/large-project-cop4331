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
import 'package:team24/models/ResumeResponse.dart';




Future<String?> getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}


Future<void> pickAndUploadResume(String title) async {
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
  await uploadPDF(file, title);
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

  request.headers.addAll(await ApiClient.authHeaders());


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

    final data = jsonDecode(response.body);

    return (data['resumes'] as List)
        .map((json) => Resume.fromJson(json))
        .toList();
  }
  
}


Future<void> showResumeActions(
  BuildContext context,
  File? file,
  String id, {
  VoidCallback? onDeleted,
  void Function(String thumbnailUrl, String versionName, String versionId)? onVersionSelected,
}) async {
  final rootContext = context;

  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.shuffle),
                label: const Text("Select Version"),
                onPressed: () async {
                  Navigator.pop(context);
                  await Future.delayed(const Duration(milliseconds: 150));
                  if (!rootContext.mounted) return;
                  await showVersionListDialog(
                    rootContext,
                    id,
                    onVersionSelected: onVersionSelected,
                    rootContext: rootContext,
                  );
                },
              ),
            ),

            const SizedBox(height: 10),
SizedBox(
  width: double.infinity,
  child: ElevatedButton.icon(
    icon: const Icon(Icons.upload_file),
    label: const Text("Add Version"),
    onPressed: () async {
      Navigator.pop(context);
      await Future.delayed(const Duration(milliseconds: 150));
      if (!rootContext.mounted) return;

      final titleController = TextEditingController();
      final confirmed = await showDialog<bool>(
        context: rootContext,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text("Version Name"),
          content: TextField(
            controller: titleController,
            autofocus: true,
            decoration: const InputDecoration(
              hintText: "Enter a name for this version",
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text("Upload"),
            ),
          ],
        ),
      );

      if (confirmed == true && rootContext.mounted) {
        final title = titleController.text.trim().isEmpty
            ? "Untitled"
            : titleController.text.trim();
        pickAndUploadVersion(title, id); // was hardcoded "title"
      }
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
                onPressed: () async {
                  Navigator.pop(context);
                  try {
                    await deleteRequest(id);
                    onDeleted?.call();
                  } catch (e) {
                    print("❌ Delete resume error: $e");
                  }
                },
              ),
            ),

          ],
        ),
      );
    },
  );
}







Future<void> showVersionListDialog(
  BuildContext context,
  String id, {
  void Function(String thumbnailUrl, String versionName, String versionId)? onVersionSelected,
  BuildContext? rootContext,
}) async {
  final dialogContext = rootContext ?? context;

  showDialog(
    context: dialogContext,
    barrierDismissible: false,
    builder: (context) => const AlertDialog(
      backgroundColor: Color(0xFF1E1E1E),
      content: Row(
        children: [
          CircularProgressIndicator(color: Color(0xFF8B0000)),
          SizedBox(width: 16),
          Text("Loading versions...", style: TextStyle(color: Colors.white)),
        ],
      ),
    ),
  );

  print("🔄 Calling getResume($id)");
  final resumeData = await getResume(id);
  print("🔄 getResume returned: ${resumeData == null ? 'NULL' : 'OK'}");
  print("🔄 context.mounted after getResume: ${dialogContext.mounted}");

  if (!dialogContext.mounted) {
    print("❌ Context not mounted — cannot pop loading dialog");
    return;
  }

  Navigator.pop(dialogContext);
  print("🔄 Loading dialog popped");

  if (resumeData == null) {
    print("❌ resumeData is null — aborting");
    return;
  }

  if (!dialogContext.mounted) return;

  final versions = resumeData.versions;
  print("✅ Loaded ${versions.length} versions for resume $id");
  for (final v in versions) {
    print("  VERSION: id=${v.id} | name=${v.name} | number=${v.versionNumber}");
  }

  String? selectedVersionId;
  String? selectedName;
  String? selectedThumbnailUrl;

  showDialog(
    context: dialogContext,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text("Select Version"),
            content: SizedBox(
              width: double.maxFinite,
              height: 300,
              child: versions.isEmpty
                  ? const Center(child: Text("No versions found"))
                  : ListView.builder(
                      itemCount: versions.length,
                      itemBuilder: (context, index) {
                        final version = versions[index];
                        return ListTile(
                          title: Text("Version ${version.versionNumber}"),
                          subtitle: Text(version.commitMessage),
                          selected: version.id == selectedVersionId,
                          onTap: () {
                            print("👆 Tapped: id=${version.id} | commitMessage=${version.commitMessage}");
                            setState(() {
                              selectedVersionId = version.id;
                              selectedThumbnailUrl = version.thumbnailUrl;
                              selectedName = version.commitMessage;
                            });
                          },
                        );
                      },
                    ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                onPressed: selectedVersionId == null
                    ? null
                    : () async {
                        print("🔄 Confirm pressed — calling activateVersion");
                        final result = await activateVersion(id, selectedVersionId!);
                        print("🔄 activateVersion result: $result");
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        onVersionSelected?.call(
                          result['thumbnailUrl'] ?? '',
                          result['name'] ?? selectedName ?? '',
                          selectedVersionId ?? '',
                        );
                      },
                child: const Text("Confirm"),
              ),
            ],
          );
        },
      );
    },
  );
}



Future<void> debugResume(String id) async {
  final url = ApiClient.checkVersion(id);

  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  print("URL: $url");
  print("STATUS: ${response.statusCode}");

  // 🔥 Convert to raw JSON object
  final rawJson = jsonDecode(response.body);

  // Pretty print everything
  print("RAW JSON: $rawJson");





  
}



Future<void> uploadVersion(File file, String title, String id) async {
  final url = ApiClient.addVersion(id);
  final token = await getToken();

  final request = http.MultipartRequest("POST", url);

  // ✅ ALWAYS add fields FIRST
  request.fields.addAll({
    'title': title,
    'commitMessage': title,
  });

  // then attach file
  request.files.add(
    await http.MultipartFile.fromPath(
      'resume',
      file.path,
      contentType: MediaType('application', 'pdf'),
    ),
  );

  // auth header
  if (token != null && token.isNotEmpty) {
    request.headers['Authorization'] = 'Bearer $token';
  }

  final response = await request.send();
  final body = await response.stream.bytesToString();

  print("STATUS: ${response.statusCode}");
  print("BODY: $body");
}

Future<void> pickAndUploadVersion(String title, String id) async {
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
  await uploadVersion(file, title, id);
}



Future<ResumeResponse?> getResume(String id) async {
  try {
    final url = ApiClient.getResume(id);

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to load resume");
    }

    final Map<String, dynamic> jsonData = json.decode(response.body);

    return ResumeResponse.fromJson(jsonData);

  } catch (e) {
    print("getResume error: $e");
    return null;
  }
}

Future<void> deleteRequest(String id) async {
  final url = ApiClient.deleteResume(id);
    final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');



  final response = await http.delete(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  print("STATUS: ${response.statusCode}");
  print("BODY: ${response.body}");

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw Exception("Failed to delete item");
  }
}

Future<Map<String, String?>> activateVersion(String resumeId, String versionId) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  final url = ApiClient.changeVersion(resumeId, versionId);
  print("🔄 ACTIVATE URL: $url");

  final response = await http.patch(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  print("🔄 ACTIVATE STATUS: ${response.statusCode}");
  print("🔄 ACTIVATE BODY: ${response.body}");

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return {
      'thumbnailUrl': data['thumbnailUrl'] as String?,
      'name': data['commitMessage'] as String?,
    };
  }

  return {'thumbnailUrl': null, 'name': null};
}