import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Register user
  Future<UserModel> register({
    required String email,
    required String password,
    required String username,
    required String role, // 'user' or 'admin'
    String? bio,
    String? location,
    String? avatar,
  }) async {
    UserCredential credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    User? user = credential.user;
    if (user == null) throw Exception("Failed to register user");

    await user.updateDisplayName(username);

    UserModel newUser = UserModel(
      uid: user.uid,
      username: username,
      email: email,
      role: role,
      bio: bio,
      location: location,
      avatar: avatar,
      totalLikes: 0,
      createdAt: DateTime.now(),
    );

    await _firestore.collection('users').doc(user.uid).set({
      'username': username,
      'email': email,
      'role': role,
      'bio': bio,
      'location': location,
      'avatar': avatar,
      'totalLikes': 0,
      'createdAt': FieldValue.serverTimestamp(),
    });

    return newUser;
  }

  // Login
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    UserCredential credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    User? user = credential.user;
    if (user == null) throw Exception("Failed to sign in");

    DocumentSnapshot doc =
        await _firestore.collection('users').doc(user.uid).get();

    if (!doc.exists) {
      // Create user record if it doesn't exist
      UserModel fallbackUser = UserModel(
        uid: user.uid,
        username: user.displayName ?? email.split('@')[0],
        email: email,
        role: 'user',
      );
      await _firestore.collection('users').doc(user.uid).set(fallbackUser.toMap());
      return fallbackUser;
    }

    return UserModel.fromMap(doc.data() as Map<String, dynamic>, user.uid);
  }

  // Get current user profile
  Future<UserModel?> getUserProfile(String uid) async {
    DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
    if (doc.exists) {
      return UserModel.fromMap(doc.data() as Map<String, dynamic>, uid);
    }
    return null;
  }

  // Stream current user profile
  Stream<UserModel?> streamUserProfile(String uid) {
    return _firestore
        .collection('users')
        .doc(uid)
        .snapshots()
        .map((doc) => doc.exists
            ? UserModel.fromMap(doc.data() as Map<String, dynamic>, uid)
            : null);
  }

  // Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
