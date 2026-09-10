import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/post_model.dart';
import '../models/admin_reply_model.dart';
import '../services/firestore_service.dart';
import 'glass_card.dart';
import 'status_badge.dart';
import 'comments_modal.dart';
import '../screens/edit_post_screen.dart';
import '../screens/complaint_map_screen.dart';



class ComplaintCard extends StatefulWidget {
  final PostModel post;
  final String currentUserId;
  final bool isAdmin;
  final VoidCallback? onStatusTap;
  final VoidCallback? onReplyTap;

  const ComplaintCard({
    super.key,
    required this.post,
    required this.currentUserId,
    this.isAdmin = false,
    this.onStatusTap,
    this.onReplyTap,
  });

  @override
  State<ComplaintCard> createState() => _ComplaintCardState();
}

class _ComplaintCardState extends State<ComplaintCard> {
  final FirestoreService _firestoreService = FirestoreService();
  bool _showHeartOverlay = false;

  void _handleDoubleTapLike() {
    setState(() {
      _showHeartOverlay = true;
    });
    Future.delayed(const Duration(milliseconds: 700), () {
      if (mounted) {
        setState(() {
          _showHeartOverlay = false;
        });
      }
    });

    if (!widget.post.likedBy.contains(widget.currentUserId)) {
      _firestoreService.toggleLike(widget.post.id, widget.currentUserId);
    }
  }

  void _openLightbox(BuildContext context, String base64String) {
    String cleanBase64 = base64String.contains(',')
        ? base64String.split(',').last
        : base64String;
    final bytes = base64Decode(cleanBase64.trim());

    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: Colors.black,
        insetPadding: EdgeInsets.zero,
        child: Stack(
          children: [
            Center(
              child: InteractiveViewer(
                child: Image.memory(bytes, fit: BoxFit.contain),
              ),
            ),
            Positioned(
              top: 40,
              right: 20,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getCategoryEmoji(String category) {
    switch (category) {
      case 'Electric':
        return '⚡ Electricity';
      case 'Water':
        return '💧 Water Supply';
      case 'Drainage':
        return '🧹 Sanitation';
      case 'Social Problem':
        return '🛡️ Public Safety';
      case 'Air':
        return '🌿 Environment';
      case 'Others':
      default:
        return '📌 General';
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isLiked = widget.post.likedBy.contains(widget.currentUserId);
    final String formattedDate =
        DateFormat('MMM d, yyyy • h:mm a').format(widget.post.createdAt);

    return GlassCard(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Author Avatar & Name & Status
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFFE11D48),
                child: widget.post.authorAvatar != null &&
                        widget.post.authorAvatar!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: widget.post.authorAvatar!.startsWith('data:')
                            ? Image.memory(
                                base64Decode(
                                    widget.post.authorAvatar!.split(',').last),
                                fit: BoxFit.cover,
                                width: 40,
                                height: 40,
                              )
                            : Image.network(
                                widget.post.authorAvatar!,
                                fit: BoxFit.cover,
                                width: 40,
                                height: 40,
                              ),
                      )
                    : Text(
                        widget.post.authorName.isNotEmpty
                            ? widget.post.authorName[0].toUpperCase()
                            : 'C',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.post.authorName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      formattedDate,
                      style: TextStyle(
                        color: Colors.grey.shade400,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              StatusBadge(status: widget.post.status),

              if (widget.post.authorId == widget.currentUserId || widget.isAdmin) ...[
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.grey),
                  color: const Color(0xFF0F172A),
                  onSelected: (value) async {
                    if (value == 'edit') {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => EditPostScreen(post: widget.post),
                        ),
                      );
                    } else if (value == 'delete') {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (_) => AlertDialog(
                          backgroundColor: const Color(0xFF0F172A),
                          title: const Text("Delete Complaint?",
                              style: TextStyle(color: Colors.white)),
                          content: const Text(
                              "Are you sure you want to permanently delete this complaint?",
                              style: TextStyle(color: Colors.grey)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text("Cancel"),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFF43F5E)),
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text("Delete",
                                  style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true) {
                        await _firestoreService.deletePost(widget.post.id);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Complaint deleted successfully')),
                          );
                        }
                      }
                    }
                  },
                  itemBuilder: (context) => [
                    if (widget.post.authorId == widget.currentUserId)
                      const PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(Icons.edit_rounded,
                                color: Color(0xFF38BDF8), size: 18),
                            SizedBox(width: 8),
                            Text("Edit Complaint",
                                style: TextStyle(color: Colors.white)),
                          ],
                        ),
                      ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_forever_rounded,
                              color: Color(0xFFF43F5E), size: 18),
                          SizedBox(width: 8),
                          Text("Delete Complaint",
                              style: TextStyle(color: Colors.white)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),


          const SizedBox(width: 0, height: 12),

          // Category pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _getCategoryEmoji(widget.post.category),
              style: const TextStyle(
                color: Color(0xFFF43F5E),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Title & Description
          Text(
            widget.post.title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            widget.post.content,
            style: TextStyle(
              color: Colors.grey.shade200,
              fontSize: 14,
              height: 1.4,
            ),
          ),

          // Geolocation Tag
          if (widget.post.address != null && widget.post.address!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on_rounded,
                    color: Color(0xFFF43F5E), size: 14),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    widget.post.address!,
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),

          // Image Attachment (Base64 decoded)
          if (widget.post.image != null && widget.post.image!.isNotEmpty) ...[
            GestureDetector(
              onDoubleTap: _handleDoubleTapLike,
              onTap: () => _openLightbox(context, widget.post.image!),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.memory(
                      base64Decode(widget.post.image!.contains(',')
                          ? widget.post.image!.split(',').last.trim()
                          : widget.post.image!.trim()),
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 220,
                      errorBuilder: (_, __, ___) => Container(
                        height: 150,
                        color: Colors.grey.shade900,
                        child: const Center(
                          child: Icon(Icons.broken_image, color: Colors.grey),
                        ),
                      ),
                    ),
                  ),
                  if (_showHeartOverlay)
                    const Icon(
                      Icons.favorite_rounded,
                      color: Color(0xFFF43F5E),
                      size: 90,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Video Attachment Indicator
          if (widget.post.video != null && widget.post.video!.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.video_library_rounded,
                      color: Color(0xFF38BDF8), size: 24),
                  SizedBox(width: 8),
                  Text(
                    "Video Evidence Attached (Base64 Firestore Stream)",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Action bar (Like / Upvote & Comments)
          Row(
            children: [
              // Like Button
              InkWell(
                onTap: () => _firestoreService.toggleLike(
                    widget.post.id, widget.currentUserId),
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8.0, vertical: 4.0),
                  child: Row(
                    children: [
                      Icon(
                        isLiked
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isLiked ? const Color(0xFFF43F5E) : Colors.grey,
                        size: 22,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${widget.post.likes}',
                        style: TextStyle(
                          color:
                              isLiked ? const Color(0xFFF43F5E) : Colors.grey,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 16),

              // Comment Button
              InkWell(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => CommentsModal(
                      post: widget.post,
                      currentUserId: widget.currentUserId,
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8.0, vertical: 4.0),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.chat_bubble_outline_rounded,
                        color: Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${widget.post.comments.length}',
                        style: const TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const Spacer(),

              // Admin Action Buttons if logged in as Admin
              if (widget.isAdmin) ...[
                IconButton(
                  icon: const Icon(Icons.map_rounded, color: Color(0xFFF43F5E)),
                  tooltip: 'View Geolocation & Route',
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ComplaintMapScreen(post: widget.post),
                      ),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.edit_note_rounded,
                      color: Color(0xFF38BDF8)),
                  tooltip: 'Update Status',
                  onPressed: widget.onStatusTap,
                ),
                IconButton(
                  icon: const Icon(Icons.reply_all_rounded,
                      color: Color(0xFF4ADE80)),
                  tooltip: 'Official Municipal Response',
                  onPressed: widget.onReplyTap,
                ),
              ],
            ],
          ),


          // Official Municipal Admin Reply Section (if existing)
          StreamBuilder<List<AdminReplyModel>>(
            stream: _firestoreService.streamAdminReplies(widget.post.id),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const SizedBox.shrink();
              }
              final reply = snapshot.data!.first;
              return Container(
                margin: const EdgeInsets.only(top: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF38BDF8).withOpacity(0.4),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.verified_rounded,
                            color: Color(0xFF38BDF8), size: 16),
                        const SizedBox(width: 6),
                        Text(
                          "Official Municipal Response by ${reply.adminName}",
                          style: const TextStyle(
                            color: Color(0xFF38BDF8),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      reply.description,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                    if (reply.image != null && reply.image!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.memory(
                          base64Decode(reply.image!.contains(',')
                              ? reply.image!.split(',').last.trim()
                              : reply.image!.trim()),
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
