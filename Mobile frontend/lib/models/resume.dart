class Resume {
  final String id;
  final String name;
  final String thumbnailUrl;

  Resume({
    required this.id,
    required this.name,
    required this.thumbnailUrl,
  });

  factory Resume.fromJson(Map<String, dynamic> json) {
    return Resume(
      id: json['_id'],
      name: json['title'],
      thumbnailUrl: "http://45.55.57.119:6767/${json['headVersion']['thumbnailS3Key']}"
    );
  }
}