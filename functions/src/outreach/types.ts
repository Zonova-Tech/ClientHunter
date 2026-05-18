// Outreach campaign + lead types. Stored in Firestore.

export type CampaignStatus = 'draft' | 'running' | 'paused' | 'stopped' | 'done';

export type LeadStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'skipped'
  | 'opted_out';

export interface CampaignPacing {
  dailyCap: number;
  perHourCap: number;
  sendWindowStart: number; // hour 0-23, inclusive
  sendWindowEnd: number;   // hour 0-23, exclusive
  skipTickProbability: number; // 0-1, e.g. 0.3 = skip 30% of eligible ticks
  maxAttempts: number;
  skipSundays: boolean;
  skipPoyaDays: boolean;
}

export interface CampaignTemplate {
  body: string; // supports {{shopName}}, {{city}} and [a|b|c] spintax
}

export interface CampaignTemplates {
  si: CampaignTemplate;
  ta: CampaignTemplate;
  en: CampaignTemplate;
}

export type LeadLanguage = 'si' | 'ta' | 'en';

export interface CampaignStats {
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
  optedOut: number;
}

export interface OutreachCampaign {
  name: string;
  status: CampaignStatus;
  testMode: boolean;
  templates: CampaignTemplates;
  pacing: CampaignPacing;
  timezone: string;
  stats: CampaignStats;
  sentToday: Record<string, number>;   // 'YYYY-MM-DD' -> count
  sentHourly: Record<string, number>;  // 'YYYY-MM-DDTHH' -> count
  consecutiveFailures: number;
  previewApproved: boolean;
  lastSentAt: FirebaseFirestore.Timestamp | null;
  lastTickAt: FirebaseFirestore.Timestamp | null;
  createdAt: FirebaseFirestore.Timestamp;
  harvestedAt: FirebaseFirestore.Timestamp | null;
}

export interface OutreachLead {
  placeId: string;
  shopName: string;
  city: string;
  phoneE164: string;
  rawPhone: string;
  address: string;
  rating: number | null;
  ratingCount: number | null;
  language: LeadLanguage;
  status: LeadStatus;
  attempts: number;
  lastError: string | null;
  sentAt: FirebaseFirestore.Timestamp | null;
  queuedAt: FirebaseFirestore.Timestamp;
}

export const DEFAULT_PACING: CampaignPacing = {
  dailyCap: 40,
  perHourCap: 6,
  sendWindowStart: 8,
  sendWindowEnd: 17,
  skipTickProbability: 0.3,
  maxAttempts: 2,
  skipSundays: true,
  skipPoyaDays: true,
};
