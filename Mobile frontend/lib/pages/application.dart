import 'package:flutter/material.dart';
import 'package:team24/services/applicationsService.dart';

class ApplicationPage extends StatefulWidget {
  final String resumeId;
  final String? resumeVersionId;
  const ApplicationPage({super.key, required this.resumeId, this.resumeVersionId});

  @override
  State<ApplicationPage> createState() => _ApplicationPageState();
}

class _ApplicationPageState extends State<ApplicationPage> {
  List<Application> _applications = [];
  bool _loading = true;

  final List<String> _statusOptions = [
    'Applied',
    'Interview',
    'Offer',
    'Rejected',
    'Ghosted',
  ];

  @override
  void initState() {
    super.initState();
    loadApplications();
  }

Future<void> loadApplications() async {
  print("🔍 Loading applications for resumeId: ${widget.resumeId}");
  print("🔍 Loading applications for versionId: ${widget.resumeVersionId}");
  try {
    final data = await ApplicationService.listApplications(
      resumeId: widget.resumeId,
      resumeVersionId: widget.resumeVersionId,
    );
    print("✅ Loaded ${data.length} applications");
    for (final a in data) {
      print("  APP: ${a.companyName} | resumeVersionId: ${a.resumeVersionId}");
    }
    print("✅ Loaded ${data.length} applications for version ${widget.resumeVersionId}");
    setState(() {
      _applications = data;
      _loading = false;
    });
  } catch (e) {
    print("❌ loadApplications error: $e");
    setState(() => _loading = false);
  }
}

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'applied':
        return Colors.blueGrey;
      case 'interview':
        return Colors.amber.shade700;
      case 'offer':
        return Colors.green.shade600;
      case 'rejected':
        return Colors.red.shade700;
      case 'ghosted':
      case 'withdrawn':
        return Colors.grey;
      default:
        return Colors.blueGrey;
    }
  }

  void _showAddDialog() {
    final companyController = TextEditingController();
    final positionController = TextEditingController();
    String selectedStatus = _statusOptions[0];

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Add Application',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: companyController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Company'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: positionController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Position'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedStatus,
                dropdownColor: const Color(0xFF1E1E1E),
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Status'),
                items: _statusOptions
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedStatus = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
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
                final company = companyController.text.trim();
                final position = positionController.text.trim();
                if (company.isEmpty || position.isEmpty) return;
                Navigator.pop(context);

                try {
  await ApplicationService.createApplication(
    resumeId: widget.resumeId,
    resumeVersionId: widget.resumeVersionId, // ✅ tie to specific version
    companyName: company,
    jobTitle: position,
    status: selectedStatus.toLowerCase(),
  );
} catch (e) {
  print("❌ Create application error: $e");
}

                // Always reload from backend regardless of response
                await loadApplications();
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(Application app) {
    final companyController = TextEditingController(text: app.companyName);
    final positionController = TextEditingController(text: app.jobTitle);

    // Match the stored status to a display option, defaulting to 'Applied'
    String selectedStatus = _statusOptions.firstWhere(
      (s) => s.toLowerCase() == app.status.toLowerCase(),
      orElse: () => _statusOptions[0],
    );

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Edit Application',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: companyController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Company'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: positionController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Position'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedStatus,
                dropdownColor: const Color(0xFF1E1E1E),
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Status'),
                items: _statusOptions
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedStatus = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
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
                final company = companyController.text.trim();
                final position = positionController.text.trim();
                if (company.isEmpty || position.isEmpty) return;
                Navigator.pop(context);

                try {
                  await ApplicationService.updateApplication(
                    app.id,
                    companyName: company,
                    jobTitle: position,
                    status: selectedStatus.toLowerCase(),
                  );
                } catch (e) {
                  print("❌ Update application error: $e");
                }

                await loadApplications();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Colors.grey),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF8B0000)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Column(
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

                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),

                const SizedBox(width: 12),

                 Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Applications',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
  widget.resumeVersionId != null
      ? 'Version applications'
      : 'All applications',
  style: const TextStyle(color: Colors.white70, fontSize: 13),
),

                    ],
                  ),
                ),

                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF8B0000),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  onPressed: _showAddDialog,
                  child: const Text(
                    'Add',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // ── Column headers ─────────────────────────────────────────
          Container(
            color: const Color(0xFF1A1A1A),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: const Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text('Company',
                      style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5)),
                ),
                Expanded(
                  flex: 3,
                  child: Text('Position',
                      style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5)),
                ),
                Expanded(
                  flex: 2,
                  child: Text('Status',
                      style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5)),
                ),
                Expanded(
                  flex: 2,
                  child: Text('Date',
                      style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5),
                      textAlign: TextAlign.right),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFF2A2A2A)),

          // ── Applications list ──────────────────────────────────────
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF8B0000),
                    ),
                  )
                : _applications.isEmpty
                    ? const Center(
                        child: Text(
                          'No applications yet',
                          style:
                              TextStyle(color: Colors.white38, fontSize: 15),
                        ),
                      )
                    : ListView.separated(
                        itemCount: _applications.length,
                        separatorBuilder: (_, __) =>
                            const Divider(height: 1, color: Color(0xFF2A2A2A)),
                        itemBuilder: (context, index) {
                          final app = _applications[index];
                          return Dismissible(
                            key: Key(app.id),
                            direction: DismissDirection.endToStart,
                            background: Container(
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              color: Colors.red.shade900,
                              child: const Icon(Icons.delete,
                                  color: Colors.white),
                            ),
                            onDismissed: (_) async {
                              setState(() => _applications.removeAt(index));
                              try {
                                await ApplicationService.deleteApplication(
                                    app.id);
                              } catch (e) {
                                print("❌ Delete error: $e");
                                await loadApplications();
                              }
                            },
                            child: GestureDetector(
                              // ✅ Tap row to edit
                              onTap: () => _showEditDialog(app),
                              child: Container(
                                color: const Color(0xFF181818),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 14),
                                child: Row(
                                  children: [
                                    Expanded(
                                      flex: 3,
                                      child: Text(
                                        app.companyName,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 3,
                                      child: Text(
                                        app.jobTitle,
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 2,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: _statusColor(app.status)
                                              .withOpacity(0.2),
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          border: Border.all(
                                            color: _statusColor(app.status),
                                            width: 1,
                                          ),
                                        ),
                                        child: Text(
                                          app.statusLabel,
                                          style: TextStyle(
                                            color: _statusColor(app.status),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 2,
                                      child: Text(
                                        app.formattedDate,
                                        style: const TextStyle(
                                          color: Colors.white38,
                                          fontSize: 12,
                                        ),
                                        textAlign: TextAlign.right,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}