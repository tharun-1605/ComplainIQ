import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/firestore_service.dart';
import '../services/media_service.dart';
import '../services/location_service.dart';
import '../models/user_model.dart';
import '../widgets/glass_card.dart';

class CreatePostScreen extends StatefulWidget {
  final UserModel currentUser;

  const CreatePostScreen({
    super.key,
    required this.currentUser,
  });

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final FirestoreService _firestoreService = FirestoreService();
  final MediaService _mediaService = MediaService();
  final LocationService _locationService = LocationService();

  String _selectedCategory = 'Electric';
  String? _imageBase64;
  String? _videoBase64;
  double? _latitude;
  double? _longitude;
  String? _address;

  bool _isLocating = false;
  bool _isSubmitting = false;

  final List<Map<String, String>> _categories = [
    {'label': '⚡ Electricity', 'value': 'Electric'},
    {'label': '💧 Water Supply', 'value': 'Water'},
    {'label': '🧹 Sanitation', 'value': 'Drainage'},
    {'label': '🛡️ Public Safety', 'value': 'Social Problem'},
    {'label': '🌿 Environment', 'value': 'Air'},
    {'label': '📌 General / Other', 'value': 'Others'},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _fetchGPSLocation() async {
    setState(() {
      _isLocating = true;
    });

    try {
      final loc = await _locationService.getCurrentLocation();
      if (mounted) {
        setState(() {
          _isLocating = false;
          _latitude = loc.latitude;
          _longitude = loc.longitude;
          _address = loc.address;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('GPS Location attached!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLocating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching location: $e')),
        );
      }
    }
  }


  void _pickImage(ImageSource source) async {
    final base64String = await _mediaService.pickImageAsBase64(source);
    if (base64String != null) {
      setState(() {
        _imageBase64 = base64String;
      });
    }
  }

  void _pickVideo(ImageSource source) async {
    final base64String = await _mediaService.pickVideoAsBase64(source);
    if (base64String != null) {
      setState(() {
        _videoBase64 = base64String;
      });
    }
  }

  void _handleSubmit() async {
    final content = _contentController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe the issue in detail.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await _firestoreService.createPost(
        title: _titleController.text.trim().isEmpty
            ? 'Civic Complaint'
            : _titleController.text.trim(),
        content: content,
        category: _selectedCategory,
        authorId: widget.currentUser.uid,
        authorName: widget.currentUser.username,
        authorAvatar: widget.currentUser.avatar,
        imageBase64: _imageBase64,
        videoBase64: _videoBase64,
        latitude: _latitude,
        longitude: _longitude,
        address: _address,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Complaint submitted successfully!')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "Report Civic Issue",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // Category Dropdown
                  const Text(
                    "Category",
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.black38,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedCategory,
                        dropdownColor: const Color(0xFF0F172A),
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF43F5E)),
                        items: _categories.map((c) {
                          return DropdownMenuItem<String>(
                            value: c['value'],
                            child: Text(
                              c['label']!,
                              style: const TextStyle(color: Colors.white),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedCategory = val);
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Title Field
                  const Text(
                    "Title",
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _titleController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "Brief summary of the problem",
                      hintStyle: TextStyle(color: Colors.grey.shade600),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFF43F5E)),
                      ),
                      filled: true,
                      fillColor: Colors.black26,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Description Field
                  const Text(
                    "Detailed Description *",
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _contentController,
                    style: const TextStyle(color: Colors.white),
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: "Describe the issue, location cues, urgency...",
                      hintStyle: TextStyle(color: Colors.grey.shade600),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFF43F5E)),
                      ),
                      filled: true,
                      fillColor: Colors.black26,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Media Pickers
                  const Text(
                    "Attach Media (Converted to Base64 String)",
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      // Image picker
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickImage(ImageSource.gallery),
                          icon: const Icon(Icons.photo_library_rounded, color: Color(0xFFF43F5E)),
                          label: const Text("Photo", style: TextStyle(color: Colors.white)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withOpacity(0.2)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Camera picker
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_rounded, color: Color(0xFF38BDF8)),
                          label: const Text("Camera", style: TextStyle(color: Colors.white)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withOpacity(0.2)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Video picker
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickVideo(ImageSource.gallery),
                          icon: const Icon(Icons.videocam_rounded, color: Color(0xFF4ADE80)),
                          label: const Text("Video", style: TextStyle(color: Colors.white)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withOpacity(0.2)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Image Preview
                  if (_imageBase64 != null) ...[
                    const SizedBox(height: 14),
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.memory(
                            base64Decode(_imageBase64!.split(',').last),
                            height: 160,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: GestureDetector(
                            onTap: () => setState(() => _imageBase64 = null),
                            child: CircleAvatar(
                              backgroundColor: Colors.black.withOpacity(0.7),
                              radius: 14,
                              child: const Icon(Icons.close, color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  // Video Preview Indicator
                  if (_videoBase64 != null) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Color(0xFF4ADE80)),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              "Video file processed into Base64 payload.",
                              style: TextStyle(color: Colors.white, fontSize: 13),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _videoBase64 = null),
                            child: const Icon(Icons.close, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Location Picker Button
                  ElevatedButton.icon(
                    onPressed: _isLocating ? null : _fetchGPSLocation,
                    icon: _isLocating
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.my_location_rounded, color: Colors.white),
                    label: Text(
                      _address != null ? "GPS Location Attached" : "Attach Current Location",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _address != null
                          ? const Color(0xFF052E16)
                          : const Color(0xFF1E293B),
                      foregroundColor: _address != null
                          ? const Color(0xFF4ADE80)
                          : Colors.white,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),

                  if (_address != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _address!,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                    ),
                  ],

                  const SizedBox(height: 28),

                  // Submit Button
                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF43F5E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            "Submit Complaint to Firestore",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
