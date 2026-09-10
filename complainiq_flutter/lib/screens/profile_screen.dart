import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_model.dart';
import '../models/post_model.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/complaint_card.dart';
import 'edit_profile_screen.dart';


class ProfileScreen extends StatelessWidget {
  final UserModel currentUser;

  const ProfileScreen({
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
          "User Profile",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_rounded, color: Color(0xFF38BDF8)),
            tooltip: "Edit Profile",
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EditProfileScreen(currentUser: currentUser),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFF43F5E)),
            tooltip: "Sign Out",
            onPressed: () async {
              final authService = Provider.of<AuthService>(context, listen: false);
              await authService.signOut();
            },
          ),
        ],
      ),

      body: StreamBuilder<UserModel?>(
        stream: Provider.of<AuthService>(context, listen: false)
            .streamUserProfile(currentUser.uid),
        builder: (context, userSnapshot) {
          final user = userSnapshot.data ?? currentUser;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Overview Card

                GlassCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 42,
                        backgroundColor: const Color(0xFFF43F5E),
                        child: user.avatar != null && user.avatar!.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(42),
                                child: user.avatar!.startsWith('data:')
                                    ? Image.memory(
                                        base64Decode(user.avatar!.split(',').last),
                                        fit: BoxFit.cover,
                                        width: 84,
                                        height: 84,
                                      )
                                    : Image.network(
                                        user.avatar!,
                                        fit: BoxFit.cover,
                                        width: 84,
                                        height: 84,
                                      ),
                              )
                            : Text(
                                user.username.isNotEmpty
                                    ? user.username[0].toUpperCase()
                                    : 'U',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        user.username,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                      ),
                      const SizedBox(height: 10),

                      // Role Pill
                      Container(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: user.role == 'admin'
                              ? const Color(0xFF0284C7).withOpacity(0.2)
                              : const Color(0xFFF43F5E).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: user.role == 'admin'
                                ? const Color(0xFF0284C7)
                                : const Color(0xFFF43F5E),
                          ),
                        ),
                        child: Text(
                          user.role == 'admin'
                              ? "MUNICIPAL ADMIN"
                              : "CITIZEN USER",
                          style: TextStyle(
                            color: user.role == 'admin'
                                ? const Color(0xFF38BDF8)
                                : const Color(0xFFF43F5E),
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),

                      if (user.location != null && user.location!.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.location_on,
                                color: Colors.grey, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              user.location!,
                              style: TextStyle(
                                  color: Colors.grey.shade300, fontSize: 12),
                            ),
                          ],
                        ),
                      ],

                      if (user.bio != null && user.bio!.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Text(
                          user.bio!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: Colors.grey.shade400,
                              fontSize: 13,
                              fontStyle: FontStyle.italic),
                        ),
                      ],

                      const SizedBox(height: 20),
                      const Divider(color: Colors.white10),
                      const SizedBox(height: 10),

                      // Upvotes Stats
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.favorite,
                              color: Color(0xFFF43F5E), size: 24),
                          const SizedBox(width: 8),
                          Text(
                            "${user.totalLikes}",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Total Community Upvotes Earned",
                            style: TextStyle(
                                color: Colors.grey.shade400, fontSize: 13),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                const Text(
                  "My Submitted Complaints",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),

                // Stream User's Complaints
                StreamBuilder<List<PostModel>>(
                  stream: firestoreService.streamUserPosts(user.uid),
                  builder: (context, postsSnapshot) {
                    if (postsSnapshot.connectionState ==
                        ConnectionState.waiting) {
                      return const Center(
                        child: CircularProgressIndicator(
                            color: Color(0xFFF43F5E)),
                      );
                    }

                    final myPosts = postsSnapshot.data ?? [];

                    if (myPosts.isEmpty) {
                      return GlassCard(
                        child: const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(
                              "You haven't reported any civic complaints yet.",
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        ),
                      );
                    }

                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: myPosts.length,
                      itemBuilder: (context, index) {
                        return ComplaintCard(
                          post: myPosts[index],
                          currentUserId: user.uid,
                          isAdmin: user.role == 'admin',
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
