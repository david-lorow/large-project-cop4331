import 'package:team24/models/resume.dart';
import 'package:team24/models/ResumeVersion.dart';
class ResumeResponse {
  final Resume resume;
  final List<ResumeVersion> versions;
  final String downloadUrl;

  ResumeResponse({
    required this.resume,
    required this.versions,
    required this.downloadUrl,
  });

  factory ResumeResponse.fromJson(Map<String, dynamic> json) {
    return ResumeResponse(
      resume: Resume.fromJson(json['resume']),
      versions: (json['versions'] as List)
    .map((v) => ResumeVersion.fromJson(v as Map<String, dynamic>))
    .toList(),
      downloadUrl: json['downloadUrl'],
    );
  }
}