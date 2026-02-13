import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/category_promo_images.dart';
import '../models/business_lead.dart';

class WhatsAppService {
  static const String defaultPromoMessage =
      'Hi! We help businesses like yours get more customers with a professional website. Would you like a quick demo?';

  String normalizePhone(String input) {
    final String normalized = input.replaceAll(RegExp(r'[^0-9]'), '');
    if (normalized.startsWith('00')) {
      return normalized.replaceFirst('00', '');
    }
    return normalized;
  }

  String buildLink({required String phone, required String message}) {
    final String encodedMessage = Uri.encodeComponent(message);
    return 'https://wa.me/$phone?text=$encodedMessage';
  }

  Future<void> openWhatsApp(BusinessLead lead, {String? message}) async {
    final String normalizedPhone = normalizePhone(lead.phone);
    final String link = buildLink(
      phone: normalizedPhone,
      message: message ?? defaultPromoMessage,
    );

    final Uri uri = Uri.parse(link);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      throw StateError('Could not launch WhatsApp link: $link');
    }
  }

  Future<void> copyPromoImageHint(BusinessLead lead) async {
    final String imageUrl =
        categoryPromoImages[lead.category] ?? fallbackPromoImage;

    // Cross-platform clipboard image support varies. For reliability in web and
    // mobile, we copy the mapped promo image URL so it can be pasted/shared.
    await Clipboard.setData(ClipboardData(text: imageUrl));
  }

  String encodedMessagePreview(String message) => utf8.decode(utf8.encode(message));
}
