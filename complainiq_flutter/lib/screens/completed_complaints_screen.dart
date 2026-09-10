import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../models/user_model.dart';
import '../services/firestore_service.dart';
import '../widgets/complaint_card.dart';
import '../widgets/glass_card.dart';

class CompletedComplaintsScreen extends StatelessWidget {
  final UserModel currentUser;

  const CompletedComplaintsScreen({
    super.key,
    required this.currentUser,
  });

  @override
  Widget build(BuildContext context) {
    final FirestoreService firestoreService = FirestoreService();

    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "Resolved & Completed Showcase",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      body: StreamBuilder<List<PostModel>>(
        stream: firestoreService.streamPosts(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFF43F5E)),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Text(
                "Error loading showcase: ${snapshot.error}",
                style: const TextStyle(color: Colors.redAccent),
              ),
            );
          }

          final allPosts = snapshot.data ?? [];
          final resolvedPosts = allPosts
              .where((p) =>
                  p.status.toLowerCase() == 'completed' ||
                  p.status.toLowerCase() == 'resolved')
              .toList();

          if (resolvedPosts.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: GlassCard(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.check_circle_outline_rounded,
                          size: 64, color: Color(0xFF4ADE80)),
                      SizedBox(height: 16),
                      Text(
                        "No Completed Complaints Yet",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "Complaints resolved or completed by municipal administrators will appear here with official evidence.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: resolvedPosts.length,
            itemBuilder: (context, index) {
              return ComplaintCard(
                post: resolvedPosts[index],
                currentUserId: currentUser.uid,
                isAdmin: currentUser.role == 'admin',
              );
            },
          );
        },
      ),
    );
  }
}
