import 'package:flutter/material.dart';

import 'data/category_promo_images.dart';
import 'models/business_lead.dart';
import 'services/lead_repository.dart';
import 'services/whatsapp_service.dart';

void main() {
  runApp(const ClientHunterApp());
}

class ClientHunterApp extends StatelessWidget {
  const ClientHunterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClientHunter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const LeadHomePage(),
    );
  }
}

class LeadHomePage extends StatefulWidget {
  const LeadHomePage({super.key});

  @override
  State<LeadHomePage> createState() => _LeadHomePageState();
}

class _LeadHomePageState extends State<LeadHomePage> {
  final LeadRepository _repository = LeadRepository();
  final WhatsAppService _whatsAppService = WhatsAppService();
  final TextEditingController _searchController = TextEditingController();

  List<BusinessLead> _allLeads = <BusinessLead>[];
  double _minRating = 4.0;
  int _minRatingCount = 0;
  bool? _hasWebsite = false;
  ContactStatusFilter _status = ContactStatusFilter.all;
  int _currentPage = 0;
  int _pageSize = 5;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadLeads();
  }

  Future<void> _loadLeads() async {
    final List<BusinessLead> leads = await _repository.loadLeads();
    if (!mounted) {
      return;
    }
    setState(() {
      _allLeads = leads;
      _loading = false;
    });
  }

  List<BusinessLead> get _filtered {
    final String query = _searchController.text.trim().toLowerCase();
    final List<BusinessLead> matches = _allLeads.where((BusinessLead lead) {
      final bool queryMatch = query.isEmpty ||
          lead.name.toLowerCase().contains(query) ||
          lead.phone.toLowerCase().contains(query) ||
          lead.address.toLowerCase().contains(query);

      final bool ratingMatch = lead.rating >= _minRating;
      final bool ratingCountMatch = lead.ratingCount >= _minRatingCount;
      final bool websiteMatch = _hasWebsite == null || lead.hasWebsite == _hasWebsite;

      final bool statusMatch;
      switch (_status) {
        case ContactStatusFilter.all:
          statusMatch = true;
          break;
        case ContactStatusFilter.notContacted:
          statusMatch = !lead.isContacted;
          break;
        case ContactStatusFilter.contacted:
          statusMatch = lead.isContacted;
          break;
      }

      return queryMatch && ratingMatch && ratingCountMatch && websiteMatch && statusMatch;
    }).toList();

    return matches;
  }

  List<BusinessLead> get _paged {
    final List<BusinessLead> items = _filtered;
    final int start = _currentPage * _pageSize;
    if (start >= items.length) {
      return <BusinessLead>[];
    }
    final int end = (start + _pageSize).clamp(0, items.length);
    return items.sublist(start, end);
  }

  int get _totalPages {
    if (_filtered.isEmpty) {
      return 1;
    }
    return (_filtered.length / _pageSize).ceil();
  }

  Future<void> _markContacted(BusinessLead lead, bool contacted) async {
    await _repository.markContacted(lead.id, contacted);
    await _loadLeads();
  }

  Future<void> _onWhatsApp(BusinessLead lead) async {
    try {
      await _whatsAppService.openWhatsApp(lead);
      await _whatsAppService.copyPromoImageHint(lead);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Opened WhatsApp. Promo image URL copied for ${lead.category}.',
          ),
        ),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to open WhatsApp: $error')),
      );
    }
  }

  void _resetPage() {
    setState(() {
      _currentPage = 0;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ClientHunter')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: <Widget>[
                  _buildFilters(),
                  const SizedBox(height: 12),
                  Expanded(
                    child: _paged.isEmpty
                        ? const Center(child: Text('No leads match your filters.'))
                        : ListView.separated(
                            itemCount: _paged.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (BuildContext context, int index) {
                              final BusinessLead lead = _paged[index];
                              return _LeadCard(
                                lead: lead,
                                imageUrl: categoryPromoImages[lead.category] ??
                                    fallbackPromoImage,
                                onWhatsApp: () => _onWhatsApp(lead),
                                onMarkContacted: () =>
                                    _markContacted(lead, !lead.isContacted),
                              );
                            },
                          ),
                  ),
                  _buildPagination(),
                ],
              ),
            ),
    );
  }

  Widget _buildFilters() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            SizedBox(
              width: 240,
              child: TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  labelText: 'Search name / phone / address',
                  border: OutlineInputBorder(),
                ),
                onChanged: (_) => _resetPage(),
              ),
            ),
            SizedBox(
              width: 170,
              child: DropdownButtonFormField<double>(
                value: _minRating,
                decoration: const InputDecoration(
                  labelText: 'Min rating',
                  border: OutlineInputBorder(),
                ),
                items: <double>[0, 3, 3.5, 4, 4.5]
                    .map(
                      (double v) => DropdownMenuItem<double>(
                        value: v,
                        child: Text(v.toString()),
                      ),
                    )
                    .toList(),
                onChanged: (double? value) {
                  if (value == null) {
                    return;
                  }
                  setState(() {
                    _minRating = value;
                    _currentPage = 0;
                  });
                },
              ),
            ),
            SizedBox(
              width: 180,
              child: DropdownButtonFormField<int>(
                value: _minRatingCount,
                decoration: const InputDecoration(
                  labelText: 'Min reviews',
                  border: OutlineInputBorder(),
                ),
                items: <int>[0, 50, 100, 200]
                    .map(
                      (int v) => DropdownMenuItem<int>(
                        value: v,
                        child: Text(v.toString()),
                      ),
                    )
                    .toList(),
                onChanged: (int? value) {
                  if (value == null) {
                    return;
                  }
                  setState(() {
                    _minRatingCount = value;
                    _currentPage = 0;
                  });
                },
              ),
            ),
            SizedBox(
              width: 190,
              child: DropdownButtonFormField<bool?>(
                value: _hasWebsite,
                decoration: const InputDecoration(
                  labelText: 'Website filter',
                  border: OutlineInputBorder(),
                ),
                items: const <DropdownMenuItem<bool?>>[
                  DropdownMenuItem<bool?>(value: false, child: Text('No website')),
                  DropdownMenuItem<bool?>(value: true, child: Text('Has website')),
                  DropdownMenuItem<bool?>(value: null, child: Text('All')),
                ],
                onChanged: (bool? value) {
                  setState(() {
                    _hasWebsite = value;
                    _currentPage = 0;
                  });
                },
              ),
            ),
            SizedBox(
              width: 200,
              child: DropdownButtonFormField<ContactStatusFilter>(
                value: _status,
                decoration: const InputDecoration(
                  labelText: 'Contact status',
                  border: OutlineInputBorder(),
                ),
                items: const <DropdownMenuItem<ContactStatusFilter>>[
                  DropdownMenuItem<ContactStatusFilter>(
                    value: ContactStatusFilter.all,
                    child: Text('All'),
                  ),
                  DropdownMenuItem<ContactStatusFilter>(
                    value: ContactStatusFilter.notContacted,
                    child: Text('Not Contacted'),
                  ),
                  DropdownMenuItem<ContactStatusFilter>(
                    value: ContactStatusFilter.contacted,
                    child: Text('Contacted'),
                  ),
                ],
                onChanged: (ContactStatusFilter? value) {
                  if (value == null) {
                    return;
                  }
                  setState(() {
                    _status = value;
                    _currentPage = 0;
                  });
                },
              ),
            ),
            SizedBox(
              width: 150,
              child: DropdownButtonFormField<int>(
                value: _pageSize,
                decoration: const InputDecoration(
                  labelText: 'Page size',
                  border: OutlineInputBorder(),
                ),
                items: const <int>[5, 10, 20]
                    .map(
                      (int v) => DropdownMenuItem<int>(
                        value: v,
                        child: Text('$v / page'),
                      ),
                    )
                    .toList(),
                onChanged: (int? value) {
                  if (value == null) {
                    return;
                  }
                  setState(() {
                    _pageSize = value;
                    _currentPage = 0;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPagination() {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: <Widget>[
          Text('Page ${_currentPage + 1} of $_totalPages'),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _currentPage > 0
                ? () {
                    setState(() {
                      _currentPage--;
                    });
                  }
                : null,
            icon: const Icon(Icons.chevron_left),
          ),
          IconButton(
            onPressed: _currentPage + 1 < _totalPages
                ? () {
                    setState(() {
                      _currentPage++;
                    });
                  }
                : null,
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}

class _LeadCard extends StatelessWidget {
  const _LeadCard({
    required this.lead,
    required this.imageUrl,
    required this.onWhatsApp,
    required this.onMarkContacted,
  });

  final BusinessLead lead;
  final String imageUrl;
  final VoidCallback onWhatsApp;
  final VoidCallback onMarkContacted;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    width: 64,
                    height: 64,
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const ColoredBox(color: Colors.black12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        lead.name,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text('Category: ${lead.category}'),
                      Text('Rating: ${lead.rating} (${lead.ratingCount} reviews)'),
                      Text('Phone: ${lead.phone}'),
                      Text('Address: ${lead.address}'),
                      Text(
                        lead.isContacted ? 'Contacted' : 'Not Contacted',
                        style: TextStyle(
                          color: lead.isContacted ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: <Widget>[
                FilledButton.icon(
                  onPressed: onWhatsApp,
                  icon: const Icon(Icons.chat),
                  label: const Text('WhatsApp'),
                ),
                OutlinedButton.icon(
                  onPressed: onMarkContacted,
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text(
                    lead.isContacted ? 'Mark as Not Contacted' : 'Mark as Contacted',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
