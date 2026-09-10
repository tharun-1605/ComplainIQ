import 'dart:convert';

import 'package:image_picker/image_picker.dart';

class MediaService {
  final ImagePicker _picker = ImagePicker();

  // Pick Image from Gallery or Camera and convert to Base64 String
  Future<String?> pickImageAsBase64(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 70, // Compression to keep payload optimal for Firestore
      );

      if (image == null) return null;

      List<int> imageBytes = await image.readAsBytes();
      String mimeType = image.mimeType ?? 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        mimeType = 'image/jpeg';
      }

      String base64String = base64Encode(imageBytes);
      return 'data:$mimeType;base64,$base64String';
    } catch (e) {
      print('Error picking image: $e');
      return null;
    }
  }

  // Pick Video from Gallery or Camera and convert to Base64 String
  Future<String?> pickVideoAsBase64(ImageSource source) async {
    try {
      final XFile? video = await _picker.pickVideo(
        source: source,
        maxDuration: const Duration(seconds: 30), // Max 30s video for Firestore size
      );

      if (video == null) return null;

      List<int> videoBytes = await video.readAsBytes();
      String mimeType = video.mimeType ?? 'video/mp4';

      String base64String = base64Encode(videoBytes);
      return 'data:$mimeType;base64,$base64String';
    } catch (e) {
      print('Error picking video: $e');
      return null;
    }
  }
}
