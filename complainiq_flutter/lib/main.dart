import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'services/auth_service.dart';
import 'models/user_model.dart';
import 'screens/login_screen.dart';
import 'screens/user_dashboard_screen.dart';

import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
  );
  runApp(const ComplainIQApp());
}


class ComplainIQApp extends StatelessWidget {
  const ComplainIQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'ComplainIQ',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFF43F5E),
            brightness: Brightness.dark,
          ),
          scaffoldBackgroundColor: const Color(0xFF030712),
          useMaterial3: true,
          fontFamily: 'Roboto',
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);

    return StreamBuilder<User?>(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF030712),
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFFF43F5E)),
            ),
          );
        }

        final firebaseUser = snapshot.data;

        if (firebaseUser == null) {
          return const LoginScreen();
        }

        return StreamBuilder<UserModel?>(
          stream: authService.streamUserProfile(firebaseUser.uid),
          builder: (context, userProfileSnapshot) {
            if (userProfileSnapshot.connectionState ==
                ConnectionState.waiting) {
              return const Scaffold(
                backgroundColor: Color(0xFF030712),
                body: Center(
                  child: CircularProgressIndicator(color: Color(0xFFF43F5E)),
                ),
              );
            }

            final userModel = userProfileSnapshot.data ??
                UserModel(
                  uid: firebaseUser.uid,
                  username: firebaseUser.displayName ?? 'Citizen',
                  email: firebaseUser.email ?? '',
                  role: 'user',
                );

            return UserDashboardScreen(currentUser: userModel);
          },
        );
      },
    );
  }
}
