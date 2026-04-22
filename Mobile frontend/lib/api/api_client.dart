import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

// Centralized API endpoint definitions for the Resume Reaper app.
class ApiClient {
  static const String baseUrl = "http://45.55.57.119:6767/api";

  // ---------------------------
  // 🔐 TOKEN WRAPPER
  // ---------------------------
  static Future<Map<String, String>> authHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null || token.isEmpty) {
      return {};
    }

    return {
      'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, String>> multipartHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    return {
      if (token != null && token.isNotEmpty)
        'Authorization': 'Bearer $token',
    };
  }

  // ---------------------------
  // Auth endpoints
  // ---------------------------
  static Uri register() => Uri.parse('$baseUrl/auth/register');
  static Uri login() => Uri.parse('$baseUrl/auth/login');

  // ---------------------------
  // Resume endpoints
  // ---------------------------
  static Uri listResume() => Uri.parse('$baseUrl/resumes');
  static Uri uploadResumes() => Uri.parse('$baseUrl/resumes/upload');
  static Uri getResume(String id) => Uri.parse('$baseUrl/resumes/$id');
  static Uri checkVersion(String resumeId) => Uri.parse('$baseUrl/resumes/$resumeId/versions');
  static Uri addVersion(String resumeId) => Uri.parse('$baseUrl/resumes/$resumeId/versions/upload');
  static Uri deleteResume(String resumeId) => Uri.parse('$baseUrl/resumes/$resumeId');
  static Uri changeVersion(String resumeId,String versionId) => Uri.parse('$baseUrl/resumes/$resumeId/versions/$versionId/activate');

  // ---------------------------
  // Application endpoints
  // ---------------------------

static Uri listApplications({String? resumeId, String? resumeVersionId}) {
  final params = <String, String>{};
  if (resumeId != null) params['resumeId'] = resumeId;
  if (resumeVersionId != null) params['resumeVersionId'] = resumeVersionId;
  return Uri.parse('$baseUrl/applications').replace(queryParameters: params.isEmpty ? null : params);
}
 
static Uri createApplication() => Uri.parse('$baseUrl/applications');
 
static Uri updateApplication(String applicationId) => Uri.parse('$baseUrl/applications/$applicationId');
 
static Uri deleteApplication(String applicationId) => Uri.parse('$baseUrl/applications/$applicationId');

}



