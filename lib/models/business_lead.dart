class BusinessLead {
  BusinessLead({
    required this.id,
    required this.name,
    required this.category,
    required this.rating,
    required this.ratingCount,
    required this.phone,
    required this.address,
    required this.hasWebsite,
    this.isContacted = false,
  });

  final String id;
  final String name;
  final String category;
  final double rating;
  final int ratingCount;
  final String phone;
  final String address;
  final bool hasWebsite;
  bool isContacted;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'category': category,
      'rating': rating,
      'ratingCount': ratingCount,
      'phone': phone,
      'address': address,
      'hasWebsite': hasWebsite,
      'isContacted': isContacted,
    };
  }

  factory BusinessLead.fromJson(Map<String, dynamic> json) {
    return BusinessLead(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      rating: (json['rating'] as num).toDouble(),
      ratingCount: json['ratingCount'] as int,
      phone: json['phone'] as String,
      address: json['address'] as String,
      hasWebsite: json['hasWebsite'] as bool,
      isContacted: json['isContacted'] as bool? ?? false,
    );
  }
}

enum ContactStatusFilter { all, notContacted, contacted }
