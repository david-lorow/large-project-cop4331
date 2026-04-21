class ApiClient {
  static const String baseUrl = "http://45.55.57.119:6767/api";

  static Uri register() => Uri.parse('$baseUrl/auth/register'); //register API
  static Uri login() => Uri.parse('$baseUrl/auth/login'); //LOGIN API
  static Uri listResume() => Uri.parse('$baseUrl/resumes'); //RESUME API??
  static Uri uploadResumes() => Uri.parse('$baseUrl/resumes/upload');
  static Uri createApplication() => Uri.parse('$baseUrl/applications');
  static Uri createVersion(String resumeId) => Uri.parse('$baseUrl/resumes/${resumeId}/versions');
}