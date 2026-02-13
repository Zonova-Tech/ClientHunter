# ClientHunter

This repository now includes the initial implementation for both:

- `ZonovaMist` (Flutter Web frontend)
- `ZonovaMistAPI` (Node.js/Express backend)

The feature set follows the project vision from the original ClientHunter brief:

- Filter businesses by rating/review thresholds
- Keep only leads with no website and WhatsApp-ready phone numbers
- Show business cards with image, name, rating, review count, phone, and address
- One-click WhatsApp chat with a website-building promo message
- Automatically copy category-relevant promo image link (Google Drive) to clipboard before opening WhatsApp

---

## Frontend (`ZonovaMist`)

### What it does

- Loads filtered businesses from backend endpoint: `/api/businesses`
- Displays all requested lead fields:
  - Business image
  - Name
  - Rating + review count
  - Phone number
  - Address
  - WhatsApp button
- On WhatsApp button click:
  1. Promo image link for that category is copied to clipboard
  2. WhatsApp click-to-chat opens with pre-filled promo message

### Run

```bash
cd ZonovaMist
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8080
```

---

## Backend (`ZonovaMistAPI`)

### What it does

- Provides filtered business leads through:
  - `GET /api/businesses?minRating=4.2&minReviews=50&waOnly=true&withoutWebsite=true`
- Applies lead quality filtering aligned with ClientHunter rules
- Attaches category promo image link from the provided Google Drive folder

### Run

```bash
cd ZonovaMistAPI
npm install
npm start
```

### Health check

```bash
curl http://localhost:8080/health
```

---

## Google Drive promo assets

Configured folder:

`https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t`

Category-to-image mapping is implemented in `ZonovaMistAPI/src/server.js` and can be updated with direct file links when exact per-category image URLs are finalized.
