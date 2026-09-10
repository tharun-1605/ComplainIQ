import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../models/user_model.dart';
import '../services/firestore_service.dart';
import '../widgets/complaint_card.dart';
import 'create_post_screen.dart';
import 'completed_complaints_screen.dart';
import 'profile_screen.dart';
import 'admin_dashboard_screen.dart';

class UserDashboardScreen extends StatefulWidget {
  final UserModel currentUser;

  const UserDashboardScreen({
    super.key,
    required this.currentUser,
  });

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  int _currentIndex = 0;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final FirestoreService _firestoreService = FirestoreService();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  final List<Map<String, String>> _storyCategories = [
    {'id': 'All', 'name': 'All Issues', 'emoji': '🏛️'},
    {'id': 'Electric', 'name': 'Electricity', 'emoji': '⚡'},
    {'id': 'Water', 'name': 'Water', 'emoji': '💧'},
    {'id': 'Drainage', 'name': 'Sanitation', 'emoji': '🧹'},
    {'id': 'Social Problem', 'name': 'Public Safety', 'emoji': '🛡️'},
    {'id': 'Air', 'name': 'Environment', 'emoji': '🌿'},
    {'id': 'Others', 'name': 'General', 'emoji': '📌'},
  ];

  Widget _buildFeedView() {
    return Column(
      children: [
        // Live Search Input Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
          child: TextField(
            controller: _searchController,
            style: const TextStyle(color: Colors.white),
            onChanged: (val) {
              setState(() => _searchQuery = val.trim().toLowerCase());
            },
            decoration: InputDecoration(
              hintText: "Search complaints by title, location...",
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14),
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFF43F5E)),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, color: Colors.grey),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: const Color(0xFF0F172A),
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
              ),
            ),
          ),
        ),

        // Instagram Stories style category selector

        Container(
          height: 90,
          color: const Color(0xFF0F172A).withOpacity(0.5),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            itemCount: _storyCategories.length,
            itemBuilder: (context, index) {
              final cat = _storyCategories[index];
              final isSelected = _selectedCategory == cat['id'];

              return GestureDetector(
                onTap: () {
                  setState(() => _selectedCategory = cat['id']!);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: isSelected
                              ? const LinearGradient(
                                  colors: [Color(0xFFF43F5E), Color(0xFFFB923C)],
                                )
                              : null,
                          border: isSelected
                              ? null
                              : Border.all(color: Colors.white24, width: 1.5),
                        ),
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: const Color(0xFF1E293B),
                          child: Text(
                            cat['emoji']!,
                            style: const TextStyle(fontSize: 18),
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        cat['name']!,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey.shade400,
                          fontSize: 11,
                          fontWeight:
                              isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Stream Complaint Feed
        Expanded(
          child: StreamBuilder<List<PostModel>>(
            stream: _firestoreService.streamPosts(category: _selectedCategory),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                  child: CircularProgressIndicator(color: Color(0xFFF43F5E)),
                );
              }

              if (snapshot.hasError) {
                return Center(
                  child: Text(
                    "Error loading feed: ${snapshot.error}",
                    style: const TextStyle(color: Colors.redAccent),
                  ),
                );
              }

              List<PostModel> posts = snapshot.data ?? [];

              if (_searchQuery.isNotEmpty) {
                posts = posts.where((p) {
                  final titleMatch = p.title.toLowerCase().contains(_searchQuery);
                  final contentMatch = p.content.toLowerCase().contains(_searchQuery);
                  final addressMatch = p.address != null &&
                      p.address!.toLowerCase().contains(_searchQuery);
                  return titleMatch || contentMatch || addressMatch;
                }).toList();
              }

              if (posts.isEmpty) {
                return Center(
                  child: Text(
                    _searchQuery.isNotEmpty
                        ? "No complaints match '$_searchQuery'"
                        : "No complaints reported under ${_selectedCategory == 'All' ? 'this category' : _selectedCategory} yet.",
                    style: const TextStyle(color: Colors.grey),
                  ),
                );
              }


              return ListView.builder(
                padding: const EdgeInsets.only(top: 8, bottom: 80),
                itemCount: posts.length,
                itemBuilder: (context, index) {
                  return ComplaintCard(
                    post: posts[index],
                    currentUserId: widget.currentUser.uid,
                    isAdmin: widget.currentUser.role == 'admin',
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      _buildFeedView(),
      CompletedComplaintsScreen(currentUser: widget.currentUser),
      ProfileScreen(currentUser: widget.currentUser),
      if (widget.currentUser.role == 'admin')
        AdminDashboardScreen(currentAdmin: widget.currentUser),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      appBar: _currentIndex == 0
          ? AppBar(
              backgroundColor: const Color(0xFF0F172A),
              elevation: 0,
              title: Row(
                children: const [
                  Icon(Icons.security_rounded, color: Color(0xFFF43F5E)),
                  SizedBox(width: 8),
                  Text(
                    "ComplainIQ",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 20,
                    ),
                  ),

                ],
              ),
            )
          : null,
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),

      // Create Complaint Floating Action Button
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) =>
                        CreatePostScreen(currentUser: widget.currentUser),
                  ),
                );
              },
              backgroundColor: const Color(0xFFF43F5E),
              icon: const Icon(Icons.add_a_photo_rounded, color: Colors.white),
              label: const Text(
                "Report Issue",
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
              ),
            )
          : null,

      // Bottom Navigation Bar
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
        },
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: const Color(0xFFF43F5E),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarStyleItem(
            icon: Icon(Icons.dynamic_feed_rounded),
            label: "Feed",
          ),
          const BottomNavigationBarStyleItem(
            icon: Icon(Icons.verified_rounded),
            label: "Completed",
          ),
          const BottomNavigationBarStyleItem(
            icon: Icon(Icons.person_rounded),
            label: "Profile",
          ),
          if (widget.currentUser.role == 'admin')
            const BottomNavigationBarStyleItem(
              icon: Icon(Icons.admin_panel_settings_rounded),
              label: "Admin Console",
            ),
        ],
      ),
    );
  }
}

class BottomNavigationBarStyleItem extends BottomNavigationBarItem {
  const BottomNavigationBarStyleItem({
    required Widget icon,
    required String label,
  }) : super(icon: icon, label: label);
}
