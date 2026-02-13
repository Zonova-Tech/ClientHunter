import '../models/business_lead.dart';

List<BusinessLead> sampleLeads() {
  return <BusinessLead>[
    BusinessLead(
      id: '1',
      name: 'Spice Avenue',
      category: 'Restaurant',
      rating: 4.5,
      ratingCount: 215,
      phone: '+91 98765 43210',
      address: 'MG Road, Bengaluru',
      hasWebsite: false,
    ),
    BusinessLead(
      id: '2',
      name: 'Glow Studio',
      category: 'Salon',
      rating: 4.6,
      ratingCount: 175,
      phone: '9876543211',
      address: 'Baner, Pune',
      hasWebsite: false,
    ),
    BusinessLead(
      id: '3',
      name: 'Iron Den Fitness',
      category: 'Gym',
      rating: 4.2,
      ratingCount: 120,
      phone: '+1 (555) 222-3333',
      address: 'Brooklyn, New York',
      hasWebsite: true,
    ),
    BusinessLead(
      id: '4',
      name: 'CityCare Clinic',
      category: 'Clinic',
      rating: 4.8,
      ratingCount: 342,
      phone: '080-44556677',
      address: 'Kormangala, Bengaluru',
      hasWebsite: false,
    ),
    BusinessLead(
      id: '5',
      name: 'Urban Retail Hub',
      category: 'Retail',
      rating: 4.1,
      ratingCount: 89,
      phone: '+44 20 7946 0958',
      address: 'Camden, London',
      hasWebsite: false,
    ),
  ];
}
