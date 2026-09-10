import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../services/location_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/status_badge.dart';

class ComplaintMapScreen extends StatefulWidget {
  final PostModel post;

  const ComplaintMapScreen({
    super.key,
    required this.post,
  });

  @override
  State<ComplaintMapScreen> createState() => _ComplaintMapScreenState();
}

class _ComplaintMapScreenState extends State<ComplaintMapScreen> {
  final LocationService _locationService = LocationService();
  LocationResult? _adminLocation;
  double? _calculatedDistanceKm;
  bool _isLoadingAdminLoc = true;

  @override
  void initState() {
    super.initState();
    _fetchAdminLocationAndRoute();
  }

  void _fetchAdminLocationAndRoute() async {
    setState(() => _isLoadingAdminLoc = true);

    try {
      final loc = await _locationService.getCurrentLocation();
      setState(() {
        _adminLocation = loc;
        if (widget.post.latitude != null && widget.post.longitude != null) {
          _calculatedDistanceKm = _locationService.calculateDistanceInKm(
            startLat: loc.latitude,
            startLng: loc.longitude,
            endLat: widget.post.latitude!,
            endLng: widget.post.longitude!,
          );
        }
      });
    } catch (e) {
      debugPrint("Admin location error: $e");
    } finally {
      if (mounted) {
        setState(() => _isLoadingAdminLoc = false);
      }
    }
  }

  void _launchTurnByTurnRoute() async {
    if (widget.post.latitude == null || widget.post.longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No GPS coordinates attached to this complaint.')),
      );
      return;
    }

    final success = await _locationService.launchRouteInMaps(
      destLat: widget.post.latitude!,
      destLng: widget.post.longitude!,
      originLat: _adminLocation?.latitude,
      originLng: _adminLocation?.longitude,
    );

    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not launch Maps application.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final double? compLat = widget.post.latitude;
    final double? compLng = widget.post.longitude;

    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "Complaint Geolocation & Routing",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
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
            // Complaint Header Card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF43F5E).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          widget.post.category,
                          style: const TextStyle(
                            color: Color(0xFFF43F5E),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      StatusBadge(status: widget.post.status),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.post.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    widget.post.content,
                    style: TextStyle(color: Colors.grey.shade300, fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 8),

                  // Destination Address
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      const Icon(Icons.pin_drop_rounded, color: Color(0xFFF43F5E), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Incident Address Location",
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              widget.post.address ?? "Coordinates attached",
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                            ),
                            if (compLat != null && compLng != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                "GPS Coordinates: ${compLat.toStringAsFixed(5)}, ${compLng.toStringAsFixed(5)}",
                                style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Routing & Admin Origin Card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.alt_route_rounded, color: Color(0xFF38BDF8), size: 22),
                      SizedBox(width: 8),
                      Text(
                        "Route Calculation & Dispatch",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Origin: Admin Position
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.my_location_rounded, color: Color(0xFF4ADE80), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Origin (Admin Current Location)",
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            _isLoadingAdminLoc
                                ? const SizedBox(
                                    height: 16,
                                    width: 16,
                                    child: CircularProgressIndicator(color: Color(0xFF38BDF8), strokeWidth: 2),
                                  )
                                : Text(
                                    _adminLocation?.address ?? "GPS position fetched",
                                    style: const TextStyle(color: Colors.white, fontSize: 13),
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const Padding(
                    padding: EdgeInsets.only(left: 8.0, top: 4, bottom: 4),
                    child: Icon(Icons.more_vert, color: Colors.grey, size: 16),
                  ),

                  // Destination
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      const Icon(Icons.location_on_rounded, color: Color(0xFFF43F5E), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Destination (Incident Spot)",
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              widget.post.address ?? "Target Coordinates",
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  if (_calculatedDistanceKm != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Estimated Route Distance:",
                            style: TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                          Text(
                            "${_calculatedDistanceKm!.toStringAsFixed(2)} km",
                            style: const TextStyle(
                              color: Color(0xFF38BDF8),
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Turn by Turn GPS Directions Launcher Button
                  ElevatedButton.icon(
                    onPressed: _launchTurnByTurnRoute,
                    icon: const Icon(Icons.navigation_rounded, color: Colors.white),
                    label: const Text(
                      "Launch Turn-by-Turn Navigation",
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
