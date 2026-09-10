import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status; // 'Pending', 'Resolved', 'Rejected', 'Completed'

  const StatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'resolved':
        bg = const Color(0xFF052E16);
        fg = const Color(0xFF4ADE80);
        icon = Icons.check_circle_rounded;
        break;
      case 'completed':
        bg = const Color(0xFF083344);
        fg = const Color(0xFF38BDF8);
        icon = Icons.task_alt_rounded;
        break;
      case 'rejected':
        bg = const Color(0xFF450A0A);
        fg = const Color(0xFFF87171);
        icon = Icons.cancel_rounded;
        break;
      case 'pending':
      default:
        bg = const Color(0xFF451A03);
        fg = const Color(0xFFFBBF24);
        icon = Icons.hourglass_top_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: fg.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: TextStyle(
              color: fg,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
