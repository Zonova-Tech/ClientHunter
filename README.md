# ClientHunter

ClientHunter is an **offline-first Flutter app** that runs on:
- Web
- Android
- iOS

The app helps discover and manage local business leads from Google Maps data without requiring a backend service.

---

## Core concept

ClientHunter filters businesses using these criteria:
- No website
- Good rating
- Good review count
- Phone number available for WhatsApp outreach

All lead data is stored and managed locally in the app database.

---

## Platform and architecture

- **Framework:** Flutter
- **Targets:** Web, Android, iOS
- **Mode:** Offline-first
- **Storage:** Local database on device/browser
- **Backend:** Not required for normal app usage

---

## Lead list requirements

Each filtered business item should display:
- Category image
- Business name
- Rating
- Rating count
- Phone number
- Address
- WhatsApp button
- **Mark as Contacted** button
- Contact status (`Not Contacted` / `Contacted`)

---

## Business actions

### 1) WhatsApp outreach
When the user clicks the **WhatsApp** button:

1. Open click-to-chat link:
   - `https://wa.me/<phone>?text=<encoded_message>`
2. Pre-fill a promo message for website development service.
3. Copy the category-relevant promo image to clipboard for easy paste in chat.

Example promo message:

`Hi! We help businesses like yours get more customers with a professional website. Would you like a quick demo?`

### 2) Mark as contacted
- User can click **Mark as Contacted** after outreach.
- Contacted state must be saved in local database.
- Contacted status should remain available across app restarts.

---

## Search, filters, and pagination

The business listing should support:

- **Search**
  - By business name
  - By phone number
  - By address keywords

- **Basic filters**
  - Minimum rating
  - Minimum rating count
  - Has/does not have website (default: no website)
  - Contact status (`All`, `Not Contacted`, `Contacted`)

- **Pagination**
  - Paginated lead list for smooth performance
  - Configurable page size
  - Previous/Next controls

---

## Promo image source

Use this Google Drive folder for category-based promo images:

- https://drive.google.com/drive/folders/1CMZzEObCHPTl6vFZBcdM1BI_CVqq7K9t

Map each business category to an appropriate image used in WhatsApp outreach.

---

## Notes

- Keep all operational data local for offline reliability.
- Normalize phone numbers before building WhatsApp links.
- URL-encode message text in click-to-chat URL.
- Keep UI consistent across web, Android, and iOS.

---

## Android setup and build

This repository now includes the Android platform project under `android/`.

### Prerequisites
- Flutter SDK installed locally
- Android SDK + platform tools
- JDK 17+

### Configure local Flutter path
1. Copy `android/local.properties.example` to `android/local.properties`
2. Set:
   - `flutter.sdk=/absolute/path/to/flutter`

### Build APK
From repo root:

```bash
flutter pub get
flutter build apk --release
```
