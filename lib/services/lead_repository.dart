import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../data/sample_leads.dart';
import '../models/business_lead.dart';

class LeadRepository {
  static const String _storageKey = 'client_hunter_leads';

  Future<List<BusinessLead>> loadLeads() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString(_storageKey);

    if (raw == null) {
      final List<BusinessLead> seeded = sampleLeads();
      await saveLeads(seeded);
      return seeded;
    }

    final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((dynamic e) => BusinessLead.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveLeads(List<BusinessLead> leads) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String raw = jsonEncode(
      leads.map((BusinessLead lead) => lead.toJson()).toList(),
    );
    await prefs.setString(_storageKey, raw);
  }

  Future<void> markContacted(String id, bool contacted) async {
    final List<BusinessLead> leads = await loadLeads();
    for (final BusinessLead lead in leads) {
      if (lead.id == id) {
        lead.isContacted = contacted;
        break;
      }
    }
    await saveLeads(leads);
  }
}
