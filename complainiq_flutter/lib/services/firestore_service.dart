import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/post_model.dart';
import '../models/admin_reply_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream all posts
  Stream<List<PostModel>> streamPosts({String? category, String? status}) {
    return _firestore.collection('posts').snapshots().map((snapshot) {
      List<PostModel> posts =
          snapshot.docs.map((doc) => PostModel.fromFirestore(doc)).toList();

      // Sort by createdAt descending
      posts.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      // Filter category if specified
      if (category != null && category != 'All' && category.isNotEmpty) {
        posts = posts
            .where((p) => p.category.toLowerCase().contains(category.toLowerCase()))
            .toList();
      }

      // Filter status if specified
      if (status != null && status != 'All' && status.isNotEmpty) {
        posts = posts
            .where((p) => p.status.toLowerCase() == status.toLowerCase())
            .toList();
      }

      return posts;
    });
  }


  // Stream user's own posts
  Stream<List<PostModel>> streamUserPosts(String authorId) {
    return _firestore
        .collection('posts')
        .where('authorId', isEqualTo: authorId)
        .snapshots()
        .map((snapshot) {
      List<PostModel> posts =
          snapshot.docs.map((doc) => PostModel.fromFirestore(doc)).toList();
      posts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return posts;
    });
  }

  // Create new complaint post
  Future<String> createPost({
    required String title,
    required String content,
    required String category,
    required String authorId,
    required String authorName,
    String? authorAvatar,
    String? imageBase64,
    String? videoBase64,
    double? latitude,
    double? longitude,
    String? address,
  }) async {
    DocumentReference docRef = await _firestore.collection('posts').add({
      'title': title.isEmpty ? 'Civic Complaint' : title,
      'content': content,
      'category': category,
      'status': 'Pending',
      'image': imageBase64,
      'video': videoBase64,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'likes': 0,
      'likedBy': [],
      'comments': [],
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });

    return docRef.id;
  }

  // Update existing complaint post
  Future<void> updatePost({
    required String postId,
    required String title,
    required String content,
    required String category,
    String? imageBase64,
    String? videoBase64,
    double? latitude,
    double? longitude,
    String? address,
  }) async {
    Map<String, dynamic> updateData = {
      'title': title,
      'content': content,
      'category': category,
      'updatedAt': FieldValue.serverTimestamp(),
    };
    if (imageBase64 != null) updateData['image'] = imageBase64;
    if (videoBase64 != null) updateData['video'] = videoBase64;
    if (latitude != null) updateData['latitude'] = latitude;
    if (longitude != null) updateData['longitude'] = longitude;
    if (address != null) updateData['address'] = address;

    await _firestore.collection('posts').doc(postId).update(updateData);
  }

  // Delete complaint post
  Future<void> deletePost(String postId) async {
    // Delete post document
    await _firestore.collection('posts').doc(postId).delete();

    // Delete associated admin replies
    QuerySnapshot replies = await _firestore
        .collection('admin_replies')
        .where('postId', isEqualTo: postId)
        .get();

    for (var doc in replies.docs) {
      await doc.reference.delete();
    }
  }

  // Update User Profile
  Future<void> updateUserProfile({
    required String uid,
    required String username,
    String? bio,
    String? location,
    String? avatarBase64,
  }) async {
    Map<String, dynamic> updateData = {
      'username': username,
      'bio': bio,
      'location': location,
    };
    if (avatarBase64 != null) updateData['avatar'] = avatarBase64;

    await _firestore.collection('users').doc(uid).update(updateData);
  }


  // Toggle like/upvote
  Future<void> toggleLike(String postId, String userId) async {
    DocumentReference postRef = _firestore.collection('posts').doc(postId);
    DocumentSnapshot doc = await postRef.get();

    if (!doc.exists) return;

    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    List<String> likedBy = List<String>.from(data['likedBy'] ?? []);
    int likes = data['likes'] ?? 0;
    String authorId = data['authorId'] ?? '';

    bool isLiked = likedBy.contains(userId);

    if (isLiked) {
      likedBy.remove(userId);
      likes = (likes - 1).clamp(0, 999999);
    } else {
      likedBy.add(userId);
      likes += 1;
    }

    await postRef.update({
      'likes': likes,
      'likedBy': likedBy,
    });

    // Update author's totalLikes counter
    if (authorId.isNotEmpty) {
      DocumentReference authorRef = _firestore.collection('users').doc(authorId);
      await authorRef.update({
        'totalLikes': FieldValue.increment(isLiked ? -1 : 1),
      }).catchError((_) {});
    }
  }

  // Add comment
  Future<void> addComment({
    required String postId,
    required String authorId,
    required String authorName,
    String? authorAvatar,
    required String text,
  }) async {
    DocumentReference postRef = _firestore.collection('posts').doc(postId);

    Map<String, dynamic> newComment = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'text': text,
      'createdAt': Timestamp.now(),
    };

    await postRef.update({
      'comments': FieldValue.arrayUnion([newComment]),
    });
  }

  // Update complaint status (Admin function)
  Future<void> updateStatus(String postId, String newStatus) async {
    await _firestore.collection('posts').doc(postId).update({
      'status': newStatus,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // Add official Admin Reply
  Future<void> addAdminReply({
    required String postId,
    required String adminId,
    required String adminName,
    String? adminAvatar,
    required String description,
    String? imageBase64,
    String? videoBase64,
    String? newStatus,
  }) async {
    await _firestore.collection('admin_replies').add({
      'postId': postId,
      'adminId': adminId,
      'adminName': adminName,
      'adminAvatar': adminAvatar,
      'description': description,
      'image': imageBase64,
      'video': videoBase64,
      'repliedAt': FieldValue.serverTimestamp(),
    });

    if (newStatus != null) {
      await updateStatus(postId, newStatus);
    }
  }

  // Stream Admin Replies for a post
  Stream<List<AdminReplyModel>> streamAdminReplies(String postId) {
    return _firestore
        .collection('admin_replies')
        .where('postId', isEqualTo: postId)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => AdminReplyModel.fromFirestore(doc)).toList());
  }

  // Fetch KPI Counts for Admin Dashboard
  Stream<Map<String, int>> streamAdminKpis() {
    return _firestore.collection('posts').snapshots().map((snapshot) {
      int total = snapshot.docs.length;
      int pending = 0;
      int resolved = 0;
      int rejected = 0;
      int completed = 0;

      for (var doc in snapshot.docs) {
        String status = (doc.data())['status'] ?? 'Pending';
        if (status == 'Pending') pending++;
        else if (status == 'Resolved') resolved++;
        else if (status == 'Rejected') rejected++;
        else if (status == 'Completed') completed++;
      }

      return {
        'total': total,
        'pending': pending,
        'resolved': resolved,
        'rejected': rejected,
        'completed': completed,
      };
    });
  }
}
