// Centralized API endpoint definitions for the Resume Reaper app.
// All URLs are built from a single baseUrl for easy environment switching.
class ApiClient {
  static const String baseUrl = "http://45.55.57.119:6767/api";

  // Auth endpoints
  static Uri register()    => Uri.parse('$baseUrl/auth/register');
  static Uri login()       => Uri.parse('$baseUrl/auth/login');

  // Resume endpoints
  static Uri listResume()                    => Uri.parse('$baseUrl/resumes');
  static Uri uploadResumes()                 => Uri.parse('$baseUrl/resumes/upload');
  static Uri getResume(String id)            => Uri.parse('$baseUrl/resumes/$id');
  static Uri createVersion(String resumeId)  => Uri.parse('$baseUrl/resumes/$resumeId/versions');

  // Application endpoints
  static Uri createApplication() => Uri.parse('$baseUrl/applications');
}