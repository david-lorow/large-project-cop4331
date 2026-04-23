import 'package:flutter/material.dart';
import 'package:team24/models/resume.dart';
import 'package:team24/pages/application.dart';
import 'package:team24/services/resumeLists.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:team24/widgets/resume_widget.dart';

// Main resume page — displays the user's resumes in a swipeable page view.
class ResumePage extends StatefulWidget {
  const ResumePage({super.key});

  @override
  State<ResumePage> createState() => _ResumePageState();
}

class _ResumePageState extends State<ResumePage> {
  int currentPage = 0;
  List<Resume> resumes = [];
  Map<int, String> _overrideThumbnailUrls = {};
  Map<int, String> _overrideResumeNames = {};
  Map<int, String> _overrideVersionIds = {};
  String _currentResumeName = '';

  @override
  void initState() {
    super.initState();
    loadResumes();
  }

  Future<void> loadResumes() async {
  try {
    final data = await ResumeService.listResumes();
    setState(() {
  resumes = data;
  _overrideThumbnailUrls = {};
  _overrideResumeNames = {};
  _overrideVersionIds = {}; // ✅
  _currentResumeName = data.isNotEmpty ? data[0].name : '';
});
  } catch (e, stack) {
    print("❌ loadResumes error: $e");
    print("❌ Stack: $stack");

    // ✅ If session expired, clear token and redirect to login
    if (e.toString().contains('401') ||
        e.toString().contains('expired') ||
        e.toString().contains('Invalid')) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', false);
      await prefs.remove('token');
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/loginAndRegister',
          (route) => false,
        );
      }
    }
  }
}

  void _showUploadDialog(BuildContext context) {
    final TextEditingController titleController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          "Enter Resume Title",
          style: TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: titleController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: "e.g. Software Engineer Resume",
            hintStyle: const TextStyle(color: Colors.grey),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFF8B0000)),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF8B0000),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              final title = titleController.text.trim();
              if (title.isEmpty) return;
              Navigator.pop(context);
              await pickAndUploadResume(title);
              await loadResumes();
            },
            child: const Text("Upload"),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          "Are you sure you want to log out?",
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("No", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF8B0000),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool('isLoggedIn', false);
              await prefs.remove('token');
              Navigator.pop(context);
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/loginAndRegister',
                (route) => false,
              );
            },
            child: const Text("Yes"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: PopScope(
        canPop: false,
        child: Column(
        children: [

          // ── Header banner ──────────────────────────────────────────
          Container(
            width: double.infinity,
            color: const Color(0xFF8B0000),
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              left: 24,
              right: 24,
              bottom: 24,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [

                // Title + subtitle
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Resume Reaper',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _currentResumeName.isNotEmpty
                            ? _currentResumeName
                            : 'Your resumes',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Logout button
                IconButton(
                  icon: const Icon(Icons.logout, color: Colors.white),
                  onPressed: () => _showLogoutDialog(context),
                  tooltip: 'Logout',
                ),
              ],
            ),
          ),

          // ── Body ───────────────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [

                  // Swipeable resume thumbnail viewer
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: SizedBox(
                      height: 500,
                      child: PageView.builder(
                        itemCount: resumes.isEmpty ? 1 : resumes.length + 1,
                        onPageChanged: (index) => setState(() {
                          currentPage = index;
                          _currentResumeName = _overrideResumeNames[index]
                              ?? (index < resumes.length ? resumes[index].name : '');
                        }),
                        itemBuilder: (context, index) {

                          // RESUME CARD
                          if (resumes.isNotEmpty && index < resumes.length) {
                            final resume = resumes[index];
                            return Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                color: const Color(0xFF1E1E1E),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.4),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  _overrideThumbnailUrls[index] ?? resume.thumbnailUrl,
                                  fit: BoxFit.cover,
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const Center(
                                      child: CircularProgressIndicator(
                                        color: Color(0xFF8B0000),
                                      ),
                                    );
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Center(
                                      child: Icon(
                                        Icons.broken_image,
                                        color: Colors.white38,
                                        size: 48,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            );
                          }

                          // ADD RESUME CARD
                          return Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              color: const Color(0xFF1E1E1E),
                              border: Border.all(
                                color: const Color(0xFF2A2A2A),
                                width: 2,
                              ),
                            ),
                            child: Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF8B0000).withOpacity(0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.add,
                                      size: 48,
                                      color: Color(0xFF8B0000),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text(
                                    "Add Resume",
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    "Upload a PDF to get started",
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.white38,
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF8B0000),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 32,
                                        vertical: 12,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    onPressed: () => _showUploadDialog(context),
                                    child: const Text("Upload Resume"),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  // Page indicator dots
                  if (resumes.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        resumes.length + 1,
                        (i) => AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: i == currentPage ? 20 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: i == currentPage
                                ? const Color(0xFF8B0000)
                                : Colors.white24,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Action buttons
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [

                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF8B0000),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            icon: const Icon(Icons.work_outline, size: 18),
                            label: const Text('Applications'),
                            onPressed: resumes.isEmpty
    ? null
    : () {
        final index = currentPage < resumes.length ? currentPage : 0;
        final resume = resumes[index];
        // ✅ Use override version if set, otherwise fall back to resume's head version
        final versionId = _overrideVersionIds[index] ?? resume.versionId;
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ApplicationPage(
              resumeId: resume.id,
              resumeVersionId: versionId,
            ),
          ),
        );
      },
                          ),
                        ),

                        const SizedBox(width: 12),

                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1E1E1E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: Color(0xFF2A2A2A)),
                              ),
                            ),
                            icon: const Icon(Icons.tune, size: 18),
                            label: const Text('Options'),
                            onPressed: resumes.isEmpty
                                ? null
                                : () => showResumeActions(
                                      context,
                                      null,
                                      resumes[currentPage < resumes.length
                                              ? currentPage
                                              : 0]
                                          .id,
                                      onDeleted: () async {
                                        await loadResumes();
                                      },
                                      onVersionSelected: (thumbnailUrl, versionName, versionId) {
                                        print("CALLBACK FIRED: $thumbnailUrl / $versionName");
                                        setState(() {
                                          _overrideThumbnailUrls[currentPage] = thumbnailUrl;
                                          _overrideResumeNames[currentPage] = versionName;
                                           _overrideVersionIds[currentPage] = versionId; // ✅ store it
                                          _currentResumeName = versionName;
                                        });
                                      },
                                    ),
                          ),
                        ),

                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
      )
    );
  }
}