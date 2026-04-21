// Data model representing a Resume object returned from the API.
class Resume {
  final String id;           // MongoDB document ID (_id)
  final String resumeId;     // Application-level resume identifier
  final String name;         // Resume title
  final String thumbnailUrl; // Full URL to the resume's thumbnail image

  Resume({
    required this.id,
    required this.resumeId,
    required this.name,
    required this.thumbnailUrl,
  });

  // Constructs a Resume from a JSON map returned by the API.
  // thumbnailUrl is built by combining the base server URL with the S3 key.
  factory Resume.fromJson(Map<String, dynamic> json) {
    return Resume(
      id:           json['_id'],
      resumeId:     json['resumeId'],
      name:         json['title'],
      thumbnailUrl: "http://45.55.57.119:6767/${json['headVersion']['thumbnailS3Key']}",
    );
  }
}