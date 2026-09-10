// File generated manually for Firebase Project complainiq
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return web;
      case TargetPlatform.linux:
        return web;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBSQ-pgcPUfeZGTWYQWK0I5LjpZI2_ExYE',
    appId: '1:23625956464:web:e320f04df5e27863ffb637',
    messagingSenderId: '23625956464',
    projectId: 'complainiq',
    authDomain: 'complainiq.firebaseapp.com',
    storageBucket: 'complainiq.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCpMYhFJn_3DShmWqIyZdaMmc1G4nwdst0',
    appId: '1:23625956464:android:7d108db2b770cd8aea88b5',
    messagingSenderId: '23625956464',
    projectId: 'complainiq',
    storageBucket: 'complainiq.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBSQ-pgcPUfeZGTWYQWK0I5LjpZI2_ExYE',
    appId: '1:23625956464:ios:e320f04df5e27863ffb637',
    messagingSenderId: '23625956464',
    projectId: 'complainiq',
    storageBucket: 'complainiq.firebasestorage.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBSQ-pgcPUfeZGTWYQWK0I5LjpZI2_ExYE',
    appId: '1:23625956464:ios:e320f04df5e27863ffb637',
    messagingSenderId: '23625956464',
    projectId: 'complainiq',
    storageBucket: 'complainiq.firebasestorage.app',
  );
}
