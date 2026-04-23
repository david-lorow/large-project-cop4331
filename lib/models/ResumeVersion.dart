class ResumeVersion {
  final String id;
  final String versionId;
  final String name;
  final String thumbnailUrl;
  final String versionNumber;
  final String commitMessage;

  ResumeVersion({
    required this.id,
    required this.versionId,
    required this.name,
    required this.thumbnailUrl,
    required this.versionNumber,
required this.commitMessage,
  });

factory ResumeVersion.fromJson(Map<String, dynamic> json) {
  final headVersion = json['headVersion'] as Map<String, dynamic>?;

 

  return ResumeVersion(
    id:            json['_id']?.toString()           ?? '',
    versionId:     json['resumeId']?.toString()      ?? '',
    name:          json['title']?.toString()         ?? '',  // 
    thumbnailUrl:  json['thumbnailUrl']?.toString()           ?? '',                         
    versionNumber: json['versionNumber']?.toString() ?? '',
    commitMessage: json['commitMessage']?.toString()   ?? '', // ✅
  );
}
}