import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const ClientHunterApp());
}

class ClientHunterApp extends StatelessWidget {
  const ClientHunterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'ClientHunter Dashboard',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const LeadListPage(),
    );
  }
}

class LeadListPage extends StatefulWidget {
  const LeadListPage({super.key});

  @override
  State<LeadListPage> createState() => _LeadListPageState();
}

class _LeadListPageState extends State<LeadListPage> {
  final _apiService = BusinessApiService();
  final _minRatingController = TextEditingController(text: '4.2');
  final _minReviewCountController = TextEditingController(text: '50');

  late Future<List<BusinessLead>> _futureBusinesses;

  @override
  void initState() {
    super.initState();
    _futureBusinesses = _apiService.fetchBusinesses();
  }

  @override
  void dispose() {
    _minRatingController.dispose();
    _minReviewCountController.dispose();
    super.dispose();
  }

  Future<void> _applyFilters() async {
    final minRating = double.tryParse(_minRatingController.text) ?? 4.2;
    final minReviewCount = int.tryParse(_minReviewCountController.text) ?? 50;

    setState(() {
      _futureBusinesses = _apiService.fetchBusinesses(
        minRating: minRating,
        minReviews: minReviewCount,
      );
    });
  }

  Future<void> _openWhatsApp(BusinessLead lead) async {
    final promoMessage =
        'Hi ${lead.name}, we can build a high-converting website for your ${lead.category} business. '
        'Would you like a quick demo and pricing?';

    final normalizedPhone = lead.phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    final waUri = Uri.parse(
      'https://wa.me/$normalizedPhone?text=${Uri.encodeComponent(promoMessage)}',
    );

    await Clipboard.setData(ClipboardData(text: lead.promoImageUrl));

    if (!mounted) return;

    final launched = await launchUrl(waUri, mode: LaunchMode.platformDefault);
    final snackText = launched
        ? 'WhatsApp opened. Promo image link copied to clipboard.'
        : 'Unable to open WhatsApp link.';

    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(snackText)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ClientHunter - Filtered Businesses')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Wrap(
              runSpacing: 12,
              spacing: 12,
              crossAxisAlignment: WrapCrossAlignment.end,
              children: [
                SizedBox(
                  width: 180,
                  child: TextField(
                    controller: _minRatingController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Min rating',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                SizedBox(
                  width: 180,
                  child: TextField(
                    controller: _minReviewCountController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Min review count',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                FilledButton(
                  onPressed: _applyFilters,
                  child: const Text('Apply filters'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: FutureBuilder<List<BusinessLead>>(
                future: _futureBusinesses,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  }

                  final businesses = snapshot.data ?? [];
                  if (businesses.isEmpty) {
                    return const Center(child: Text('No businesses matched the filters.'));
                  }

                  return ListView.separated(
                    itemCount: businesses.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final lead = businesses[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  lead.imageUrl,
                                  width: 120,
                                  height: 120,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 120,
                                    height: 120,
                                    color: Colors.grey.shade200,
                                    alignment: Alignment.center,
                                    child: const Icon(Icons.store),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      lead.name,
                                      style: Theme.of(context).textTheme.titleMedium,
                                    ),
                                    const SizedBox(height: 4),
                                    Text('Category: ${lead.category}'),
                                    Text('Rating: ${lead.rating} (${lead.ratingCount} reviews)'),
                                    Text('Phone: ${lead.phoneNumber}'),
                                    Text('Address: ${lead.address}'),
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: [
                                        OutlinedButton.icon(
                                          onPressed: () => _openWhatsApp(lead),
                                          icon: const Icon(Icons.chat_bubble_outline),
                                          label: const Text('WhatsApp'),
                                        ),
                                        SelectableText(
                                          'Promo image: ${lead.promoImageUrl}',
                                          style: Theme.of(context).textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BusinessApiService {
  static const _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );

  Future<List<BusinessLead>> fetchBusinesses({
    double minRating = 4.2,
    int minReviews = 50,
  }) async {
    final uri = Uri.parse(
      '$_baseUrl/api/businesses?minRating=$minRating&minReviews=$minReviews&waOnly=true&withoutWebsite=true',
    );

    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('API responded with status ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final data = decoded['data'] as List<dynamic>;
    return data.map((item) => BusinessLead.fromJson(item as Map<String, dynamic>)).toList();
  }
}

class BusinessLead {
  const BusinessLead({
    required this.name,
    required this.category,
    required this.rating,
    required this.ratingCount,
    required this.phoneNumber,
    required this.address,
    required this.imageUrl,
    required this.promoImageUrl,
  });

  final String name;
  final String category;
  final double rating;
  final int ratingCount;
  final String phoneNumber;
  final String address;
  final String imageUrl;
  final String promoImageUrl;

  factory BusinessLead.fromJson(Map<String, dynamic> json) {
    return BusinessLead(
      name: json['name'] as String,
      category: json['category'] as String,
      rating: (json['rating'] as num).toDouble(),
      ratingCount: json['ratingCount'] as int,
      phoneNumber: json['phoneNumber'] as String,
      address: json['address'] as String,
      imageUrl: json['imageUrl'] as String,
      promoImageUrl: json['promoImageUrl'] as String,
    );
  }
}
