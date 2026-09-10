class UserModel {
  final String uid;
  final String username;
  final String email;
  final String role; // 'user' or 'admin'
  final String? avatar; // Base64 data string or URL
  final String? bio;
  final String? location;
  final int totalLikes;
  final DateTime? createdAt;

  UserModel({
    required this.uid,
    required this.username,
    required this.email,
    required this.role,
    this.avatar,
    this.bio,
    this.location,
    this.totalLikes = 0,
    this.createdAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> data, String uid) {
    return UserModel(
      uid: uid,
      username: data['username'] ?? 'User',
      email: data['email'] ?? '',
      role: data['role'] ?? 'user',
      avatar: data['avatar'],
      bio: data['bio'],
      location: data['location'],
      totalLikes: data['totalLikes'] ?? 0,
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as dynamic).toDate()
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'username': username,
      'email': email,
      'role': role,
      'avatar': avatar,
      'bio': bio,
      'location': location,
      'totalLikes': totalLikes,
      'createdAt': createdAt,
    };
  }
}
