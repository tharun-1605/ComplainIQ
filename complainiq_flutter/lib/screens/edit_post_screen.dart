import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/post_model.dart';
import '../services/firestore_service.dart';
import '../services/media_service.dart';
import '../services/location_service.dart';
import '../widgets/glass_card.dart';

class EditPostScreen extends StatefulWidget {
  final PostModel post;

  const EditPostScreen({
    super.key,
    required this.post,
  });

  @override
  State<EditPostScreen> createState() => _EditPostScreenState();
}

class _EditPostScreenState extends State<EditPostScreen> {
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  final FirestoreService _firestoreService = FirestoreService();
  final MediaService _mediaService = MediaService();
  final LocationService _locationService = LocationService();

  late String _selectedCategory;
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
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.post.title);
    _contentController = TextEditingController(text: widget.post.content);
    _selectedCategory = widget.post.category;
    _imageBase64 = widget.post.image;
    _videoBase64 = widget.post.video;
    _latitude = widget.post.latitude;
    _longitude = widget.post.longitude;
    _address = widget.post.address;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _fetchGPSLocation() async {
    setState(() => _isLocating = true);

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
          const SnackBar(content: Text('GPS Location updated!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLocating = false);
      }
    }
  }


  void _pickImage(ImageSource source) async {
    final base64String = await _mediaService.pickImageAsBase64(source);
    if (base64String != null) {
      setState(() => _imageBase64 = base64String);
    }
  }

  void _pickVideo(ImageSource source) async {
    final base64String = await _mediaService.pickVideoAsBase64(source);
    if (base64String != null) {
      setState(() => _videoBase64 = base64String);
    }
  }

  void _handleUpdate() async {
    final content = _contentController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Description cannot be empty.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _firestoreService.updatePost(
        postId: widget.post.id,
        title: _titleController.text.trim().isEmpty
            ? 'Civic Complaint'
            : _titleController.text.trim(),
        content: content,
        category: _selectedCategory,
        imageBase64: _imageBase64,
        videoBase64: _videoBase64,
        latitude: _latitude,
        longitude: _longitude,
        address: _address,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Complaint updated successfully!')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
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
          "Edit Complaint",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: GlassCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category
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
                    value: _categories.any((c) => c['value'] == _selectedCategory)
                        ? _selectedCategory
                        : 'Others',
                    dropdownColor: const Color(0xFF0F172A),
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF43F5E)),
                    items: _categories.map((c) {
                      return DropdownMenuItem<String>(
                        value: c['value'],
                        child: Text(c['label']!, style: const TextStyle(color: Colors.white)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Title
              const Text(
                "Title",
                style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
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

              // Content
              const Text(
                "Detailed Description",
                style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _contentController,
                style: const TextStyle(color: Colors.white),
                maxLines: 4,
                decoration: InputDecoration(
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

              // Media Picker Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickImage(ImageSource.gallery),
                      icon: const Icon(Icons.photo_library_rounded, color: Color(0xFFF43F5E)),
                      label: const Text("Replace Photo", style: TextStyle(color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withOpacity(0.2)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickVideo(ImageSource.gallery),
                      icon: const Icon(Icons.videocam_rounded, color: Color(0xFF4ADE80)),
                      label: const Text("Replace Video", style: TextStyle(color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withOpacity(0.2)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),

              if (_imageBase64 != null) ...[
                const SizedBox(height: 12),
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.memory(
                        base64Decode(_imageBase64!.contains(',')
                            ? _imageBase64!.split(',').last
                            : _imageBase64!),
                        height: 150,
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

              const SizedBox(height: 16),

              // Location button
              ElevatedButton.icon(
                onPressed: _isLocating ? null : _fetchGPSLocation,
                icon: const Icon(Icons.my_location_rounded, color: Colors.white),
                label: Text(
                  _address != null ? "Location: $_address" : "Update Location",
                  overflow: TextOverflow.ellipsis,
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 44),
                ),
              ),

              const SizedBox(height: 28),

              // Update Button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleUpdate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF43F5E),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        "Save Changes",
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
