import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';

// Data model matching the Application document returned by the backend.
class Application {
  final String id;
  final String resumeId;
  final String? resumeVersionId;
  final String companyName;
  final String jobTitle;
  final String status;       // 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  final String? jobLink;
  final String? location;
  final String? notes;
  final String? dateApplied; // ISO date string e.g. "2025-04-01T00:00:00.000Z"
  final String? createdAt;

  Application({
    required this.id,
    required this.resumeId,
    this.resumeVersionId,
    required this.companyName,
    required this.jobTitle,
    required this.status,
    this.jobLink,
    this.location,
    this.notes,
    this.dateApplied,
    this.createdAt,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    // resumeVersionId may come back as a populated object or a plain ID string
    final rawVersion = json['resumeVersionId'];
    final versionId = rawVersion is Map
        ? rawVersion['_id']?.toString()
        : rawVersion?.toString();

    return Application(
      id:              json['_id']?.toString()          ?? '',
      resumeId:        json['resumeId']?.toString()     ?? '',
      resumeVersionId: versionId,
      companyName:     json['companyName']?.toString()  ?? '',
      jobTitle:        json['jobTitle']?.toString()     ?? '',
      status:          json['status']?.toString()       ?? 'applied',
      jobLink:         json['jobLink']?.toString(),
      location:        json['location']?.toString(),
      notes:           json['notes']?.toString(),
      dateApplied:     json['dateApplied']?.toString(),
      createdAt:       json['createdAt']?.toString(),
    );
  }

  // Returns a display-friendly date string.
  String get formattedDate {
    if (dateApplied == null) return '—';
    try {
      final dt = DateTime.parse(dateApplied!).toLocal();
      return '${dt.month}/${dt.day}/${dt.year}';
    } catch (_) {
      return dateApplied!;
    }
  }

  // Returns a capitalised status label for display.
  String get statusLabel {
    if (status.isEmpty) return 'Applied';
    return status[0].toUpperCase() + status.substring(1);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

Future<String?> _getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}

Map<String, String> _authHeaders(String? token) => {
  'Content-Type': 'application/json',
  if (token != null) 'Authorization': 'Bearer $token',
};

// ── Service ────────────────────────────────────────────────────────────────

class ApplicationService {

  /// GET /api/applications?resumeId=<id>
  /// Returns all applications for the current user, optionally filtered by resume.
  static Future<List<Application>> listApplications({
    String? resumeId,
    String? resumeVersionId,
  }) async {
    final token = await _getToken();
    final url = ApiClient.listApplications(
      resumeId: resumeId,
      resumeVersionId: resumeVersionId,
    );

    final response = await http.get(url, headers: _authHeaders(token));

    print("LIST APPLICATIONS STATUS: ${response.statusCode}");

    if (response.statusCode != 200) {
      throw Exception("Failed to load applications: ${response.body}");
    }

    final data = jsonDecode(response.body);
    return (data['applications'] as List)
        .map((json) => Application.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// POST /api/applications
  /// Creates a new application tied to a resume (and optionally a specific version).
  /// The backend will fall back to the resume's headVersionId if no versionId is given.
  static Future<Application> createApplication({
  required String resumeId,
  String? resumeVersionId,
  required String companyName,
  required String jobTitle,
  String status = 'applied',
  String? jobLink,
  String? location,
  String? notes,
  String? dateApplied,
}) async {
  final token = await _getToken();

  final body = <String, dynamic>{
    'resumeId':    resumeId,
    'companyName': companyName,
    'jobTitle':    jobTitle,
    'status':      status,
    if (resumeVersionId != null) 'resumeVersionId': resumeVersionId,
    if (jobLink != null)         'jobLink':         jobLink,
    if (location != null)        'location':        location,
    if (notes != null)           'notes':           notes,
    if (dateApplied != null)     'dateApplied':     dateApplied,
  };

  // ✅ Print exactly what we're sending
  print("CREATE APPLICATION URL: ${ApiClient.createApplication()}");
  print("CREATE APPLICATION BODY SENT: ${jsonEncode(body)}");
  print("CREATE APPLICATION TOKEN: ${token != null ? 'present' : 'MISSING'}");

  final response = await http.post(
    ApiClient.createApplication(),
    headers: _authHeaders(token),
    body: jsonEncode(body),
  );

  print("CREATE APPLICATION STATUS: ${response.statusCode}");
  print("CREATE APPLICATION RESPONSE: ${response.body}"); // ✅ full backend error
  
  if (response.statusCode != 200 && response.statusCode != 201) {
    throw Exception("Failed to create application: ${response.body}");
  }

  final data = jsonDecode(response.body);
  return Application.fromJson(data['application'] as Map<String, dynamic>);
}
  /// PATCH /api/applications/:id
  /// Updates only the fields that are provided (all optional).
  static Future<Application> updateApplication(
    String applicationId, {
    String? companyName,
    String? jobTitle,
    String? status,
    String? jobLink,
    String? location,
    String? notes,
    String? dateApplied,
  }) async {
    final token = await _getToken();

    final body = <String, dynamic>{
      if (companyName != null)  'companyName':  companyName,
      if (jobTitle != null)     'jobTitle':     jobTitle,
      if (status != null)       'status':       status,
      if (jobLink != null)      'jobLink':      jobLink,
      if (location != null)     'location':     location,
      if (notes != null)        'notes':        notes,
      if (dateApplied != null)  'dateApplied':  dateApplied,
    };

    final response = await http.patch(
      ApiClient.updateApplication(applicationId),
      headers: _authHeaders(token),
      body: jsonEncode(body),
    );

    print("UPDATE APPLICATION STATUS: ${response.statusCode}");
    print("UPDATE APPLICATION BODY: ${response.body}");

    if (response.statusCode != 200) {
      throw Exception("Failed to update application: ${response.body}");
    }

    final data = jsonDecode(response.body);
    return Application.fromJson(data['application'] as Map<String, dynamic>);
  }

  /// DELETE /api/applications/:id
  static Future<void> deleteApplication(String applicationId) async {
    final token = await _getToken();

    final response = await http.delete(
      ApiClient.deleteApplication(applicationId),
      headers: _authHeaders(token),
    );

    print("DELETE APPLICATION STATUS: ${response.statusCode}");
    print("DELETE APPLICATION BODY: ${response.body}");

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception("Failed to delete application: ${response.body}");
    }
  }
}