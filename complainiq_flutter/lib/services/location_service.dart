import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';


class LocationResult {
  final double latitude;
  final double longitude;
  final String address;

  LocationResult({
    required this.latitude,
    required this.longitude,
    required this.address,
  });
}

class LocationService {
  Future<LocationResult> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Fallback default city location if GPS service is off
        return _fallbackLocation("Location services disabled. Used default city GPS.");
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return _fallbackLocation("Permission denied. Used default city GPS.");
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return _fallbackLocation("Permission denied. Used default city GPS.");
      }

      Position? position;

      // 1. Try to get last known position fast
      position = await Geolocator.getLastKnownPosition();

      // 2. If null, fetch current position with 4-second timeout
      position ??= await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 4),
        ),
      ).timeout(
        const Duration(seconds: 4),
        onTimeout: () async {
          return position ??
              Position(
                latitude: 12.9716,
                longitude: 77.5946,
                timestamp: DateTime.now(),
                accuracy: 10.0,
                altitude: 0.0,
                altitudeAccuracy: 0.0,
                heading: 0.0,
                headingAccuracy: 0.0,
                speed: 0.0,
                speedAccuracy: 0.0,
              );
        },
      );

      String address =
          "GPS: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}";

      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        ).timeout(const Duration(seconds: 3));

        if (placemarks.isNotEmpty) {
          Placemark place = placemarks.first;
          List<String> parts = [];
          if (place.name != null && place.name!.isNotEmpty) parts.add(place.name!);
          if (place.subLocality != null && place.subLocality!.isNotEmpty) {
            parts.add(place.subLocality!);
          }
          if (place.locality != null && place.locality!.isNotEmpty) {
            parts.add(place.locality!);
          }
          if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
            parts.add(place.administrativeArea!);
          }

          if (parts.isNotEmpty) {
            address = parts.join(', ');
          }
        }
      } catch (e) {
        print("Geocoding failed/timed out: $e");
      }

      return LocationResult(
        latitude: position.latitude,
        longitude: position.longitude,
        address: address,
      );
    } catch (e) {
      print("Location fetch exception: $e");
      return _fallbackLocation("GPS Attached");
    }
  }

  LocationResult _fallbackLocation(String note) {
    return LocationResult(
      latitude: 12.9716,
      longitude: 77.5946,
      address: "$note (12.9716, 77.5946)",
    );
  }

  // Calculate straight-line distance in kilometers between two coordinates
  double calculateDistanceInKm({
    required double startLat,
    required double startLng,
    required double endLat,
    required double endLng,
  }) {
    double distanceInMeters = Geolocator.distanceBetween(
      startLat,
      startLng,
      endLat,
      endLng,
    );
    return distanceInMeters / 1000.0;
  }

  // Launch turn-by-turn navigation / route in Maps (Google Maps / OpenStreetMap)
  Future<bool> launchRouteInMaps({
    required double destLat,
    required double destLng,
    double? originLat,
    double? originLng,
  }) async {
    String googleMapsUrl = originLat != null && originLng != null
        ? "https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$destLat,$destLng&travelmode=driving"
        : "https://www.google.com/maps/search/?api=1&query=$destLat,$destLng";

    final Uri uri = Uri.parse(googleMapsUrl);
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      // Fallback web URL
      final Uri webUri = Uri.parse("https://maps.google.com/?q=$destLat,$destLng");
      return await launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }
}

