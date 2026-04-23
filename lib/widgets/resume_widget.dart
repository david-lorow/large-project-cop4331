import 'package:flutter/material.dart';
import '../models/resume.dart'; // adjust path if needed
 
/// A self-contained PageView widget that displays resume cards
/// and an "Add Resume" card at the end.
///
/// Place this file in: lib/widgets/resume_widgets.dart
class ResumePageView extends StatelessWidget {
  final List<Resume> resumes;
  final Future<void> Function(String title) onUpload;
  final Future<void> Function() onRefresh;
  final void Function(int index) onPageChanged;
 
  const ResumePageView({
    super.key,
    required this.resumes,
    required this.onUpload,
    required this.onRefresh,
    required this.onPageChanged,
  });
 
  void _showUploadDialog(BuildContext context) {
    final TextEditingController titleController = TextEditingController();
 
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text("Enter Resume Title"),
        content: TextField(
          controller: titleController,
          decoration: const InputDecoration(
            hintText: "e.g. Software Engineer Resume",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              final title = titleController.text.trim();
              if (title.isEmpty) return;
              Navigator.pop(context);
 
              // Wait for upload to finish, then refresh
              await onUpload(title);
              await onRefresh();
            },
            child: const Text("Upload"),
          ),
        ],
      ),
    );
  }
 
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(30, 15, 30, 0),
      child: SizedBox(
        height: 500,
        child: PageView.builder(
          itemCount: resumes.isEmpty ? 1 : resumes.length + 1,
          onPageChanged: onPageChanged,
          itemBuilder: (context, index) {
            // RESUME CARD
            if (resumes.isNotEmpty && index < resumes.length) {
              return _ResumeCard(resume: resumes[index]);
            }
 
            // ADD RESUME CARD
            return _AddResumeCard(
              onTap: () => _showUploadDialog(context),
            );
          },
        ),
      ),
    );
  }
}
 
/// Displays a single resume thumbnail card.
class _ResumeCard extends StatelessWidget {
  final Resume resume;
 
  const _ResumeCard({required this.resume});
 
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 416,
      height: 500,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Colors.grey,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          resume.thumbnailUrl,
          fit: BoxFit.cover,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return const Center(child: CircularProgressIndicator());
          },
          errorBuilder: (context, error, stackTrace) {
            return const Center(
              child: Icon(Icons.broken_image, color: Colors.grey),
            );
          },
        ),
      ),
    );
  }
}
 
/// Displays the "Add Resume" card shown at the end of the PageView.
class _AddResumeCard extends StatelessWidget {
  final VoidCallback onTap;
 
  const _AddResumeCard({required this.onTap});
 
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 416,
      height: 500,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Colors.grey.shade300,
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.add, size: 60),
            const SizedBox(height: 10),
            const Text(
              "Add Resume",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: onTap,
              child: const Text("Upload Resume"),
            ),
          ],
        ),
      ),
    );
  }
}



