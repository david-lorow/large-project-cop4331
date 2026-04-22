class Resume {
  final String id;
  final String resumeId;
  final String name;
  final String thumbnailUrl;
  final String versionNumber;

  Resume({
    required this.id,
    required this.resumeId,
    required this.name,
    required this.thumbnailUrl,
    required this.versionNumber,
  });

  factory Resume.fromJson(Map<String, dynamic> json) {
    final headVersion = json['headVersionId'] as Map<String, dynamic>?;

    return Resume(
      id:            json['_id']?.toString()                    ?? '',
      resumeId:      json['resumeId']?.toString()               ?? '',
      name:          json['title']?.toString()                  ?? '',
      versionNumber: headVersion?['versionNumber']?.toString()  ?? '',
      thumbnailUrl:  json['thumbnailUrl']?.toString()           ?? '',
    );
  }
}