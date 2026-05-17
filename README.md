# ClientHunter

> A lead generation & CRM tool for web agencies — find businesses that need a website, and close them on WhatsApp.

ClientHunter helps web agencies in Sri Lanka identify high-potential clients: businesses with strong offline reputation (high Google ratings and reviews) but zero web presence. Once a lead is found, the built-in WhatsApp gateway lets you send outreach messages without leaving the app, and a lightweight CRM tracks each lead through your sales pipeline.

---

## Features

### Smart Lead Search

- Search any location + niche via Google Places API (e.g. "Restaurants in Colombo")
- Auto-filters results to only show ideal prospects:
  - No existing website
  - Minimum 10 reviews (established businesses)
  - Sri Lankan mobile number (07x / +947x format — WhatsApp-ready)
  - Currently operational
- Results sorted by review count (highest social proof first)
- Field masking keeps API costs in the cheapest billing tier

### Lead Scoring

| Score | Criteria |
|---|---|
| 🔥 Hot Lead | 100+ reviews **and** 4.0+ rating |
| ⭐ Potential | 50+ reviews |
| Cold | < 50 reviews |

### WhatsApp Outreach

- One-click outreach with a pre-filled message template
- Automatic phone formatting: local (077 xxx xxxx) → international (9477xxxxxxx)
- Backend gateway (HostGrap) with rate limiting and audit logging
- Graceful fallback: opens `wa.me` link if the gateway is unavailable

### Pipeline / Mini-CRM

- Save any search result to your pipeline with one click
- Track lead status: **New → Contacted → Lead**
- Add notes, email address, and website URL to each record
- Search and filter saved leads by name, category, status, and score

---

## Tech Stack

**Frontend**
- React 19 + Vite 7
- Tailwind CSS 4
- Lucide React (icons)
- Firebase SDK 12 (Firestore + App Check)

**Backend**
- Node.js + Express 4 (TypeScript)
- Firebase Admin SDK (App Check verification + audit logging)
- HostGrap API (WhatsApp message delivery)
- Helmet, express-rate-limit, CORS

**Services**
- Google Places API — business discovery
- Firebase Firestore — lead storage
- Firebase App Check (reCAPTCHA v3) — frontend request verification
- HostGrap — WhatsApp gateway

---

## Architecture

```
Browser (React + Vite)
    │
    ├── Google Places API ──────── business search
    ├── Firebase Firestore ─────── lead read / write
    └── ClientHunter Backend
              │
              ├── App Check token verification
              ├── Rate limiting (30 req / 60 min per IP)
              ├── HostGrap API ─────── message delivery
              └── Firestore audit log
```

---

## Project Structure

```
ClientHunter/
├── src/                              # Frontend (React)
│   ├── components/
│   │   ├── SearchView.jsx            # Lead discovery interface
│   │   ├── PipelineView.jsx          # CRM / pipeline view
│   │   ├── LeadCard.jsx              # Search result card
│   │   ├── PipelineCard.jsx          # Saved lead card with actions
│   │   ├── Sidebar.jsx               # Navigation + stats
│   │   └── WhatsAppSendButton.jsx    # WhatsApp send UI
│   ├── hooks/
│   │   ├── useLeads.js               # Firestore CRUD
│   │   └── usePlacesSearch.js        # Google Places integration & filtering
│   ├── utils/
│   │   └── leadUtils.js              # Scoring, phone formatting, WhatsApp helpers
│   ├── services/
│   │   └── whatsappService.js        # Backend API client
│   └── config/
│       └── firebase.js               # Firebase + App Check initialisation
├── backend/                          # WhatsApp API gateway (Express + TypeScript)
│   └── src/
│       ├── index.ts
│       ├── routes/whatsapp.ts        # POST /api/whatsapp/send-text & send-image
│       ├── services/
│       │   ├── hostgrap.ts           # HostGrap API client
│       │   └── auditLog.ts           # Sends logged to Firestore
│       ├── middleware/
│       │   ├── appCheck.ts
│       │   ├── rateLimit.ts
│       │   └── cors.ts
│       └── config/
│           ├── firebase.ts
│           └── env.ts
└── .github/workflows/
    ├── dev-cicd.yml                  # Firebase Hosting deploy
    └── deploy-serverby.yml           # ServerByt FTP deploy
```

---

## Prerequisites

- Node.js 20+
- Google Cloud project with **Places API** and **Maps JavaScript API** enabled
- Firebase project with **Firestore** and **App Check** enabled
- HostGrap account (for WhatsApp sends)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/Zonova-Tech/ClientHunter.git
cd ClientHunter
npm install
```

### 2. Frontend environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google Maps (Places API)
VITE_GOOGLE_MAPS_API_KEY=

# Firebase App Check — reCAPTCHA v3 site key
# 1. Create a reCAPTCHA v3 key at https://www.google.com/recaptcha/admin
# 2. Register it in Firebase Console → App Check → Web app → reCAPTCHA v3
VITE_RECAPTCHA_V3_SITE_KEY=

# Set to "true" during local development to print a debug token in the browser
# console, then register that token in Firebase Console → App Check → Manage debug tokens.
VITE_APP_CHECK_DEBUG_TOKEN=false

# Backend API URL
# Dev:  http://localhost:8787
# Prod: https://api.your-clienthunter-domain.com
VITE_API_BASE_URL=http://localhost:8787
```

> **Demo mode**: Leave `VITE_GOOGLE_MAPS_API_KEY` empty to run the app with mock data (5 sample businesses) and explore the UI without any API keys.

### 3. Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# HostGrap WhatsApp API
HOSTGRAP_EMAIL=
HOSTGRAP_API_KEY=
HOSTGRAP_ADMIN_PHONE=           # International format, e.g. 94751234567

# Firebase Admin SDK
# Download a service account key from Firebase Console → Project Settings → Service Accounts
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# CORS — comma-separated allowed origins
ALLOWED_ORIGINS=http://localhost:5173,https://your-clienthunter-domain.com

# Rate limiting
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=30

# Server
PORT=8787
NODE_ENV=development

# App Check enforcement (set to false only for local debugging without App Check)
REQUIRE_APP_CHECK=true
```

Place your Firebase service account JSON at `backend/firebase-service-account.json`.

### 4. Run

**Frontend** — http://localhost:5173:

```bash
npm run dev
```

**Backend** — http://localhost:8787:

```bash
cd backend
npm run dev
```

---

## Firestore Schema

### Collection: `leads`

```js
{
  placeId: "ChIJ...",               // Google Place ID (unique key)
  businessName: "Silva's Cafe",
  category: "Restaurant",
  ratingCount: 156,
  rating: 4.5,
  leadScore: "Hot",                 // "Hot" | "Warm" | "Cold"
  phone: "077 123 4567",            // Display format
  formattedWhatsapp: "94771234567", // International format (for wa.me links)
  address: "123 Galle Road, Colombo",
  email: "",                        // Manually added after saving
  webUrl: "",                       // Manually added after closing
  images: ["https://..."],          // Google Places photo URLs
  status: "New",                    // "New" | "Contacted" | "Lead"
  notes: "Owner: Mr. Silva",
  createdAt: Timestamp,
  lastContactedAt: Timestamp        // Auto-set when status changes to Contacted
}
```

### Security Rules (production)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
    match /auditLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if false;        // backend-only writes via Admin SDK
    }
  }
}
```

---

## Deployment

Both CI/CD workflows trigger on push to `dev` and build the frontend with all `VITE_*` secrets injected at build time.

### Firebase Hosting

Workflow: `.github/workflows/dev-cicd.yml`

Required GitHub secrets:

| Secret | Description |
|---|---|
| `FIREBASE_TOKEN` | Generate with `firebase login:ci` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_API_KEY` | And all other `VITE_*` variables |

### ServerByt (FTP)

Workflow: `.github/workflows/deploy-serverby.yml`

Required GitHub secrets:

| Secret | Description |
|---|---|
| `SERVERBY_HOST` | FTP hostname |
| `SERVERBY_USER` | FTP username |
| `SERVERBY_PASSWORD` | FTP password |
| `SERVERBY_PATH` | Remote deploy path |

---

## Customization

### Lead scoring thresholds

Edit [`src/utils/leadUtils.js`](src/utils/leadUtils.js):

```js
export const calculateLeadScore = (ratingCount, rating) => {
  if (ratingCount > 100 && rating > 4.0) return 'Hot';
  if (ratingCount > 50) return 'Warm';
  return 'Cold';
};
```

### WhatsApp message template

Edit the message string in [`src/components/LeadCard.jsx`](src/components/LeadCard.jsx):

```js
const message = `Your custom outreach message for ${place.displayName.text}`;
```

### Places API fields

Edit the `fieldMask` in [`src/hooks/usePlacesSearch.js`](src/hooks/usePlacesSearch.js) to add or remove fields. Each field group has a different per-request cost — see the [Places API billing docs](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) before adding fields from higher tiers.

---

## Available Scripts

**Frontend** (root):

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

**Backend** (`backend/`):

| Script | Description |
|---|---|
| `npm run dev` | Start with `tsx --watch` (auto-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting |

---

## License

MIT — Built for web agencies in Sri Lanka 🇱🇰
