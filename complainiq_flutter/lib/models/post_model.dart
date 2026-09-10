import 'package:cloud_firestore/cloud_firestore.dart';

class CommentModel {
  final String id;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final String text;
  final DateTime createdAt;

  CommentModel({
    required this.id,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.text,
    required this.createdAt,
  });

  factory CommentModel.fromMap(Map<String, dynamic> map, String id) {
    return CommentModel(
      id: id,
      authorId: map['authorId'] ?? '',
      authorName: map['authorName'] ?? 'Anonymous',
      authorAvatar: map['authorAvatar'],
      text: map['text'] ?? '',
      createdAt: map['createdAt'] is Timestamp
          ? (map['createdAt'] as Timestamp).toDate()
          : (map['createdAt'] is String
              ? DateTime.tryParse(map['createdAt']) ?? DateTime.now()
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'text': text,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

class PostModel {
  final String id;
  final String title;
  final String content;
  final String category; // 'Electric', 'Water', 'Drainage', 'Social Problem', 'Air', 'Others'
  final String status; // 'Pending', 'Resolved', 'Rejected', 'Completed'
  final String? image; // Base64 data string
  final String? video; // Base64 data string
  final double? latitude;
  final double? longitude;
  final String? address;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final int likes;
  final List<String> likedBy;
  final List<CommentModel> comments;
  final DateTime createdAt;

  PostModel({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.status,
    this.image,
    this.video,
    this.latitude,
    this.longitude,
    this.address,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    this.likes = 0,
    this.likedBy = const [],
    this.comments = const [],
    required this.createdAt,
  });

  factory PostModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;

    List<CommentModel> commentsList = [];
    if (data['comments'] != null && data['comments'] is List) {
      commentsList = (data['comments'] as List).map((c) {
        if (c is Map<String, dynamic>) {
          return CommentModel.fromMap(c, c['id'] ?? '');
        }
        return CommentModel(
          id: '',
          authorId: '',
          authorName: 'User',
          text: c.toString(),
          createdAt: DateTime.now(),
        );
      }).toList();
    }

    return PostModel(
      id: doc.id,
      title: data['title'] ?? 'Civic Complaint',
      content: data['content'] ?? '',
      category: data['category'] ?? 'Others',
      status: data['status'] ?? 'Pending',
      image: data['image'],
      video: data['video'],
      latitude: data['latitude'] != null ? (data['latitude'] as num).toDouble() : null,
      longitude: data['longitude'] != null ? (data['longitude'] as num).toDouble() : null,
      address: data['address'],
      authorId: data['authorId'] ?? '',
      authorName: data['authorName'] ?? 'Anonymous Citizen',
      authorAvatar: data['authorAvatar'],
      likes: data['likes'] ?? 0,
      likedBy: data['likedBy'] != null ? List<String>.from(data['likedBy']) : [],
      comments: commentsList,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'content': content,
      'category': category,
      'status': status,
      'image': image,
      'video': video,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'likes': likes,
      'likedBy': likedBy,
      'comments': comments.map((c) => c.toMap()).toList(),
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
