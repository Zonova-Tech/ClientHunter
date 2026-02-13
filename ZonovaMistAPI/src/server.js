const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const promoImagesByCategory = {
  restaurant: 'https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t?resourcekey=restaurant',
  salon: 'https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t?resourcekey=salon',
  clinic: 'https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t?resourcekey=clinic',
  gym: 'https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t?resourcekey=gym',
};

const businesses = [
  {
    id: '1',
    name: 'Spice Route Restaurant',
    category: 'restaurant',
    rating: 4.6,
    ratingCount: 189,
    phoneNumber: '+91 98765 43210',
    address: '21 MG Road, Bengaluru',
    website: '',
    whatsappAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    name: 'Glow & Grace Salon',
    category: 'salon',
    rating: 4.4,
    ratingCount: 127,
    phoneNumber: '+91 99887 66554',
    address: '5th Avenue, Hyderabad',
    website: null,
    whatsappAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    name: 'CityCare Dental Clinic',
    category: 'clinic',
    rating: 4.8,
    ratingCount: 98,
    phoneNumber: '+91 90123 45678',
    address: 'Lake View Street, Pune',
    website: '',
    whatsappAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    name: 'Iron Temple Fitness',
    category: 'gym',
    rating: 4.1,
    ratingCount: 40,
    phoneNumber: '+91 90909 22334',
    address: 'Ring Road, Jaipur',
    website: '',
    whatsappAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    name: 'Metro Auto Works',
    category: 'workshop',
    rating: 4.7,
    ratingCount: 220,
    phoneNumber: '+91 91234 56789',
    address: 'Industrial Area, Chennai',
    website: 'https://metroautoworks.example.com',
    whatsappAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
  }
];

app.get('/api/businesses', (req, res) => {
  const minRating = Number(req.query.minRating || 0);
  const minReviews = Number(req.query.minReviews || 0);
  const waOnly = String(req.query.waOnly || 'false') === 'true';
  const withoutWebsite = String(req.query.withoutWebsite || 'false') === 'true';

  const filtered = businesses
    .filter((business) => business.rating >= minRating)
    .filter((business) => business.ratingCount >= minReviews)
    .filter((business) => (waOnly ? business.whatsappAvailable : true))
    .filter((business) =>
      withoutWebsite ? !business.website || business.website.trim().length === 0 : true
    )
    .map((business) => ({
      id: business.id,
      name: business.name,
      category: business.category,
      rating: business.rating,
      ratingCount: business.ratingCount,
      phoneNumber: business.phoneNumber,
      address: business.address,
      imageUrl: business.imageUrl,
      promoImageUrl:
        promoImagesByCategory[business.category] ||
        'https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t',
    }));

  res.json({
    count: filtered.length,
    data: filtered,
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`ZonovaMistAPI listening on port ${port}`);
});
