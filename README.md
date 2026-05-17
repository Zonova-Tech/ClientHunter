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

- One-click outreach with an editable message template
- Image attachment: a category-matching promo image is attached automatically
- Automatic phone formatting: local (077 xxx xxxx) → international (9477xxxxxxx)
- Firebase Cloud Function gateway (HostGrap) with rate limiting and audit logging
- Graceful fallback: opens `wa.me` link if the gateway is unavailable
- Auto-marks the lead as **Contacted** on successful send

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

**Backend (Firebase Cloud Functions, 2nd gen)**
- Node.js 20 + Express 4 (TypeScript)
- Region: `asia-south1`
- Firebase Admin SDK (App Check verification + audit logging)
- HostGrap API (WhatsApp message delivery)
- Promo images served as static files from the function
- Helmet, express-rate-limit, CORS

**Services**
- Google Places API — business discovery
- Firebase Firestore — lead storage
- Firebase App Check (reCAPTCHA v3) — frontend request verification
- HostGrap — WhatsApp gateway

---

## Architecture

```
Browser (React + Vite, served from Firebase Hosting)
    │
    ├── Google Places API ──────────────── business search
    ├── Firebase Firestore ─────────────── lead read / write
    └── Firebase Hosting rewrites
              │
              ├── /api/**          → Cloud Function `api`
              └── /promo-images/** → Cloud Function `api` (static serve)
                       │
                       ├── App Check token verification
                       ├── Rate limiting (30 req / 60 min per IP)
                       ├── HostGrap API ─── message delivery
                       └── Firestore audit log (messageLog collection)
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
│   │   └── WhatsAppSendButton.jsx    # WhatsApp send UI with edit
│   ├── hooks/
│   │   ├── useLeads.js               # Firestore CRUD
│   │   └── usePlacesSearch.js        # Google Places integration & filtering
│   ├── utils/
│   │   ├── leadUtils.js              # Scoring, phone formatting, WhatsApp helpers
│   │   └── sampleImages.js           # Category → promo image mapping
│   ├── services/
│   │   └── whatsappService.js        # Cloud Function API client
│   └── config/
│       └── firebase.js               # Firebase + App Check initialisation
├── functions/                        # Firebase Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── index.ts                  # Exports `api` (onRequest)
│   │   ├── app.ts                    # Express app builder
│   │   ├── routes/whatsapp.ts        # /api/whatsapp/send & send-image
│   │   ├── services/
│   │   │   ├── hostgrap.ts           # HostGrap API client
│   │   │   └── auditLog.ts           # Sends logged to Firestore
│   │   ├── middleware/
│   │   │   ├── appCheck.ts           # X-Firebase-AppCheck verification
│   │   │   ├── rateLimit.ts
│   │   │   ├── cors.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/phone.ts            # Sri Lankan mobile normalization
│   │   └── config/
│   │       ├── firebase.ts           # Admin SDK init (auto-credentials)
│   │       └── env.ts                # Secret/param config
│   ├── public/promo-images/          # Category promo images (PNG)
│   └── .env                          # Non-secret params only
├── firebase.json                     # Hosting + Functions config
├── .firebaserc                       # Default project: client-hunter-app-a3de6
└── .github/workflows/
    └── dev-cicd.yml                  # CI: build + deploy Hosting & Functions
```

---

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud project with **Places API** and **Maps JavaScript API** enabled
- Firebase project on the **Blaze plan** (Functions require outbound HTTP)
- Firebase **Firestore** and **App Check** enabled
- HostGrap account (for WhatsApp sends)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/Zonova-Tech/ClientHunter.git
cd ClientHunter
npm install
cd functions && npm install && cd ..
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

# Set "true" during local dev to print a debug token in the browser console,
# then register that token in Firebase Console → App Check → Manage debug tokens.
VITE_APP_CHECK_DEBUG_TOKEN=true

# Cloud Function URL
# Dev:  https://asia-south1-<project-id>.cloudfunctions.net/api
# Prod: leave empty — Firebase Hosting rewrites /api/** to the function
VITE_API_BASE_URL=https://asia-south1-client-hunter-app-a3de6.cloudfunctions.net/api
```

`.env.production` (auto-applied during `vite build`) overrides this so production uses same-origin URLs and disables the debug token.

### 3. Cloud Function secrets

Secrets are stored in **Google Secret Manager** and injected at runtime. Set each one with `firebase functions:secrets:set` (use `printf`, **not** `echo`, to avoid trailing newlines):

```bash
printf "your-hostgrap-email@example.com" > /tmp/v && firebase functions:secrets:set HOSTGRAP_EMAIL --data-file /tmp/v && rm /tmp/v
printf "your-hostgrap-api-key"            > /tmp/v && firebase functions:secrets:set HOSTGRAP_API_KEY --data-file /tmp/v && rm /tmp/v
printf "94751234567"                      > /tmp/v && firebase functions:secrets:set HOSTGRAP_ADMIN_PHONE --data-file /tmp/v && rm /tmp/v
```

Non-secret runtime params live in `functions/.env`:

```env
ALLOWED_ORIGINS=https://client-hunter-app-a3de6.web.app,https://client-hunter-app-a3de6.firebaseapp.com,http://localhost:5173
REQUIRE_APP_CHECK=true
TEST_PHONE_OVERRIDE=        # set to your number to redirect all sends during testing
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=30
```

### 4. Run locally

**Frontend** — http://localhost:5173:

```bash
npm run dev
```

In dev mode the frontend calls the **deployed** Cloud Function URL (because HostGrap needs a publicly fetchable image URL). To work entirely offline, run the Functions emulator and point `VITE_API_BASE_URL` at `http://localhost:5001/<project-id>/asia-south1/api`.

---

## Firestore Schema

### Collection: `leads`

```js
{
  placeId: "ChIJ...",
  businessName: "Silva's Cafe",
  category: "Restaurant",
  ratingCount: 156,
  rating: 4.5,
  leadScore: "Hot",
  phone: "077 123 4567",
  formattedWhatsapp: "94771234567",
  address: "123 Galle Road, Colombo",
  email: "",
  webUrl: "",
  images: ["https://..."],
  status: "New",                // "New" | "Contacted" | "Lead"
  notes: "Owner: Mr. Silva",
  createdAt: Timestamp,
  lastContactedAt: Timestamp    // Auto-set on successful WhatsApp send
}
```

### Collection: `messageLog`

Each WhatsApp send (success or failure) writes one document:

```js
{
  type: "text" | "image",
  status: "success" | "failed",
  phone: "94771234567",
  message: "...",
  imageUrl: "https://...",      // image sends only
  errorMessage: "...",          // failures only
  source: "clienthunter",
  ip: "1.2.3.4",
  userAgent: "Mozilla/5.0...",
  createdAt: Timestamp
}
```

---

## Deployment

CI/CD: `.github/workflows/dev-cicd.yml` triggers on push to `dev` and deploys both Hosting and Functions.

### Required GitHub secrets

| Secret | Description |
|---|---|
| `FIREBASE_TOKEN` | Generate with `firebase login:ci` |
| `FIREBASE_PROJECT_ID` | `client-hunter-app-a3de6` |
| `VITE_FIREBASE_API_KEY` | Web SDK config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Web SDK config |
| `VITE_FIREBASE_PROJECT_ID` | Web SDK config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Web SDK config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Web SDK config |
| `VITE_FIREBASE_APP_ID` | Web SDK config |
| `VITE_GOOGLE_MAPS_API_KEY` | Places & Maps JS API |
| `VITE_RECAPTCHA_V3_SITE_KEY` | App Check site key |

Cloud Function secrets (`HOSTGRAP_EMAIL`, `HOSTGRAP_API_KEY`, `HOSTGRAP_ADMIN_PHONE`) live in **Google Secret Manager**, not in GitHub.

### Manual deploy

```bash
# Build the frontend
npm run build

# Deploy everything
firebase deploy

# Or just one side
firebase deploy --only hosting
firebase deploy --only functions
```

After deploy:
- Frontend: https://client-hunter-app-a3de6.web.app
- Function:  https://asia-south1-client-hunter-app-a3de6.cloudfunctions.net/api

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

Edit `buildOutreachMessage` in [`src/utils/leadUtils.js`](src/utils/leadUtils.js). Users can also edit each message inline in the confirmation modal before sending.

### Promo images

Drop additional `.png` files into `functions/public/promo-images/`. Mapping from Google Places category to filename is in [`src/utils/sampleImages.js`](src/utils/sampleImages.js) (`CATEGORY_ALIASES` + auto plural/singular matching).

### Places API fields

Edit the `fieldMask` in [`src/hooks/usePlacesSearch.js`](src/hooks/usePlacesSearch.js). Each field group has a different per-request cost — see the [Places API billing docs](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing).

---

## Available Scripts

**Root (frontend):**

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

**`functions/`:**

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript to `lib/` |
| `npm run serve` | Build + start Functions emulator |
| `npm run deploy` | `firebase deploy --only functions` |
| `npm run logs` | Tail deployed function logs |

---

## License

MIT — Built for web agencies in Sri Lanka 🇱🇰
