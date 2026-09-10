import 'package:cloud_firestore/cloud_firestore.dart';

class AdminReplyModel {
  final String id;
  final String postId;
  final String adminId;
  final String adminName;
  final String? adminAvatar;
  final String description;
  final String? image; // Base64 data string
  final String? video; // Base64 data string
  final DateTime repliedAt;

  AdminReplyModel({
    required this.id,
    required this.postId,
    required this.adminId,
    required this.adminName,
    this.adminAvatar,
    required this.description,
    this.image,
    this.video,
    required this.repliedAt,
  });

  factory AdminReplyModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return AdminReplyModel(
      id: doc.id,
      postId: data['postId'] ?? '',
      adminId: data['adminId'] ?? '',
      adminName: data['adminName'] ?? 'Municipal Officer',
      adminAvatar: data['adminAvatar'],
      description: data['description'] ?? '',
      image: data['image'],
      video: data['video'],
      repliedAt: data['repliedAt'] != null
          ? (data['repliedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'postId': postId,
      'adminId': adminId,
      'adminName': adminName,
      'adminAvatar': adminAvatar,
      'description': description,
      'image': image,
      'video': video,
      'repliedAt': Timestamp.fromDate(repliedAt),
    };
  }
}
