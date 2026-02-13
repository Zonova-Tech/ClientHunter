# ClientHunter

ClientHunter is an automation workflow that uses the **Google Maps API** to discover local businesses and filter leads based on high-value outreach criteria.

The system focuses on businesses that:
- **Do not have a website**
- Have a **good rating**
- Have a **strong review count**
- Provide a **phone number with WhatsApp availability**

After filtering, ClientHunter extracts the business type and contact data, then sends a relevant pre-created marketing image (based on business category) via WhatsApp.

---

## What this project does

1. Query business listings from Google Maps API.
2. Filter records using lead-quality conditions.
3. Identify WhatsApp-capable phone numbers.
4. Classify/normalize business type.
5. Match business type to a pre-created image asset.
6. Send personalized outreach through WhatsApp.

---

## Lead filtering logic (high level)

A business is considered a target lead when it matches all required conditions:

- Website is missing or empty.
- Rating is above the configured threshold.
- Review count is above the configured threshold.
- Contact number is present and valid for WhatsApp messaging.

> Exact threshold values (rating/reviews) should be configured in environment variables or a config file in implementation.

---

## Data points collected

Typical fields collected for each business:

- Business name
- Business category/type
- Google Maps place ID
- Rating
- Review count
- Phone number
- WhatsApp availability
- Address/location
- Website presence status

---

## WhatsApp outreach flow

1. Build a qualified lead list from filtered business data.
2. Select a relevant creative image for the detected business type (e.g., restaurant, salon, clinic, etc.).
3. Compose a short message template.
4. Send message + image to WhatsApp number.
5. Log delivery status and errors.

---

## Suggested architecture

### Frontend
- Dashboard to configure filters (rating, review count, categories)
- Lead list and status tracking
- Campaign controls and message templates

### Backend
- Google Maps data ingestion service
- Lead filtering engine
- Business type classifier / mapper
- WhatsApp sender service
- Image asset resolver by business type
- Logging and retry mechanisms

---

## Future improvements

- Better business-type classification using AI/NLP.
- Duplicate lead detection across campaigns.
- Delivery analytics and response tracking.
- Multi-language WhatsApp templates.
- Time-window scheduling for outreach compliance.

---

## Notes

- Ensure compliance with Google Maps API usage terms.
- Ensure WhatsApp messaging complies with local regulations and platform policies.
- Use opt-out handling and respectful outreach practices.
