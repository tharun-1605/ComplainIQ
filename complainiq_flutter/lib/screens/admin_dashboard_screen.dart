import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../models/user_model.dart';
import '../services/firestore_service.dart';
import '../widgets/complaint_card.dart';
import '../widgets/glass_card.dart';
import 'admin_reply_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  final UserModel currentAdmin;

  const AdminDashboardScreen({
    super.key,
    required this.currentAdmin,
  });

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  String _selectedFilterStatus = 'All';

  void _showStatusDialog(PostModel post) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          title: Text(
            "Update Status: ${post.title}",
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: ['Pending', 'Resolved', 'Rejected', 'Completed']
                .map((status) => ListTile(
                      title: Text(status, style: const TextStyle(color: Colors.white)),
                      trailing: post.status == status
                          ? const Icon(Icons.check, color: Color(0xFF38BDF8))
                          : null,
                      onTap: () async {
                        Navigator.of(context).pop();
                        await _firestoreService.updateStatus(post.id, status);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Status updated to $status')),
                          );
                        }
                      },
                    ))
                .toList(),
          ),
        );
      },
    );
  }

  Widget _buildKpiCard(String title, int count, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              "$count",
              style: TextStyle(
                color: color,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "Executive Admin Console",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // KPI Bar
          StreamBuilder<Map<String, int>>(
            stream: _firestoreService.streamAdminKpis(),
            builder: (context, snapshot) {
              final kpis = snapshot.data ??
                  {
                    'total': 0,
                    'pending': 0,
                    'resolved': 0,
                    'rejected': 0,
                    'completed': 0
                  };

              return Padding(
                padding: const EdgeInsets.all(12.0),
                child: GlassCard(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      _buildKpiCard('Total', kpis['total']!, Colors.white,
                          Icons.dashboard_rounded),
                      const SizedBox(width: 6),
                      _buildKpiCard('Pending', kpis['pending']!,
                          const Color(0xFFFBBF24), Icons.hourglass_top_rounded),
                      const SizedBox(width: 6),
                      _buildKpiCard('Resolved', kpis['resolved']!,
                          const Color(0xFF4ADE80), Icons.check_circle_rounded),
                      const SizedBox(width: 6),
                      _buildKpiCard('Completed', kpis['completed']!,
                          const Color(0xFF38BDF8), Icons.task_alt_rounded),
                    ],
                  ),
                ),
              );
            },
          ),

          // Filter Status Pills Bar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: ['All', 'Pending', 'Resolved', 'Rejected', 'Completed']
                  .map((status) {
                final bool isSelected = _selectedFilterStatus == status;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(status),
                    selected: isSelected,
                    selectedColor: const Color(0xFF0284C7),
                    backgroundColor: Colors.white10,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey.shade400,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (_) {
                      setState(() => _selectedFilterStatus = status);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 8),

          // Complaints Feed for Admin
          Expanded(
            child: StreamBuilder<List<PostModel>>(
              stream: _firestoreService.streamPosts(
                  status: _selectedFilterStatus),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF0284C7)),
                  );
                }

                final posts = snapshot.data ?? [];

                if (posts.isEmpty) {
                  return const Center(
                    child: Text(
                      "No complaints match the selected filter.",
                      style: TextStyle(color: Colors.grey),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    final post = posts[index];
                    return ComplaintCard(
                      post: post,
                      currentUserId: widget.currentAdmin.uid,
                      isAdmin: true,
                      onStatusTap: () => _showStatusDialog(post),
                      onReplyTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => AdminReplyScreen(
                              post: post,
                              currentAdmin: widget.currentAdmin,
                            ),
                          ),
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
