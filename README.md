# Client Hunter 🎯

A specialized Lead Generation & CRM tool built for web agencies in Sri Lanka. Find businesses with high foot traffic (high ratings) but poor digital presence (no website), and manage outreach via WhatsApp.

## ✨ Features

### 🔍 Smart Lead Search
- Search for businesses by location and niche (e.g., "Restaurants in Colombo")
- **Cost-optimized API calls** using Google Places API field masking
- Automatic filtering for ideal prospects:
  - ✅ Minimum 10 reviews (established businesses)
  - ✅ No website (potential clients)
  - ✅ Mobile phone only (WhatsApp friendly - 07x format)
  - ✅ Operational status

### 🏆 Lead Scoring & Badges
- **🔥 HOT LEAD** - 100+ reviews AND 4.0+ rating
- **⭐ Potential** - 50+ reviews
- Results sorted by review count (highest first)

### 💬 WhatsApp Integration
- One-click WhatsApp messaging with pre-filled templates
- Smart phone number formatting (local to international)
- "Test WhatsApp" button to verify numbers

### 📊 Pipeline Management (Mini-CRM)
- Save leads with one click
- Track status: New → Qualified → Contacted → Interested → Closed
- Add notes (e.g., "Owner name is Silva")
- Manually add email and website URL after closing
- Filter and search saved leads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud Account with Places API enabled
- Firebase Project with Firestore

### 1. Clone & Install

```bash
cd "Client Hunter"
npm install
```

### 2. Configure Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Places API** and **Maps JavaScript API**
4. Create an API key with appropriate restrictions
5. Edit `index.html` and replace `YOUR_API_KEY`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode for development)
4. Go to Project Settings → General → Your apps → Web app
5. Copy your config values
6. Create `.env` file from the example:

```bash
cp .env.example .env
```

7. Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the App

```bash
npm run download:samples
npm run dev
```

Visit `http://localhost:5173`

### Sample Images (WhatsApp Clipboard)

The app can copy a category-specific sample image to your clipboard (so you can paste it into WhatsApp), but Google Drive blocks browser CORS for direct image downloads. Use:

```bash
npm run download:samples
```

This downloads the shared Drive images into `public/sample-images/samples/` so they are served from the app’s origin and can be copied as image bytes.

## 📁 Project Structure

```
src/
├── components/
│   ├── LeadCard.jsx        # Search result card with actions
│   ├── PipelineCard.jsx    # Saved lead card with status management
│   ├── PipelineView.jsx    # Pipeline/CRM view
│   ├── SearchView.jsx      # Search interface
│   └── Sidebar.jsx         # Navigation sidebar
├── config/
│   └── firebase.js         # Firebase configuration
├── hooks/
│   ├── useLeads.js         # Firestore CRUD operations
│   └── usePlacesSearch.js  # Google Places API integration
├── utils/
│   └── leadUtils.js        # Utility functions (scoring, formatting)
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
└── index.css               # Tailwind CSS styles
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps API**: Google Places API (New)
- **Database**: Firebase Firestore
- **State**: React Hooks

## 📊 Firestore Schema

### Collection: `leads`

```javascript
{
  placeId: "ChIJ...",           // Google Place ID
  businessName: "Silva's Cafe",
  category: "Restaurant",
  ratingCount: 156,
  rating: 4.5,
  leadScore: "Hot",             // "Hot" | "Warm" | "Cold"
  phone: "077 123 4567",
  formattedWhatsapp: "94771234567",
  address: "123 Galle Road, Colombo",
  email: "",                    // Manual entry
  webUrl: "",                   // Manual entry
  images: ["https://..."],      // Photo references
  status: "New",                // "New" | "Qualified" | "Contacted" | "Interested" | "Closed"
  notes: "Owner: Mr. Silva, interested in basic website",
  createdAt: Timestamp
}
```

## 🔒 Firestore Security Rules

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 💰 Cost Optimization

The app uses **Field Masking** to minimize Google Places API costs:

```javascript
// Only these fields are requested:
- id, displayName, rating, userRatingCount
- nationalPhoneNumber, websiteUri, businessStatus
- photos, types, formattedAddress
```

## 🎨 Customization

### Modify Lead Scoring
Edit `src/utils/leadUtils.js`:

```javascript
export const calculateLeadScore = (ratingCount, rating) => {
  if (ratingCount > 100 && rating > 4.0) return 'Hot';
  if (ratingCount > 50) return 'Warm';
  return 'Cold';
};
```

### Change WhatsApp Message Template
Edit `src/components/LeadCard.jsx`:

```javascript
const handleWhatsAppClick = () => {
  const message = `Your custom message here for ${place.displayName}`;
  window.open(getWhatsAppUrl(place.nationalPhoneNumber, message), '_blank');
};
```

## 📝 License

MIT License - Built for web agencies in Sri Lanka 🇱🇰

---

Built with ❤️ for finding clients who need websites!