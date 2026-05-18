// Pure decisions about whether the scheduler should send a message this tick.
// All logic timezone-aware against the campaign's configured timezone.

import type { OutreachCampaign } from './types';
import { isPoyaDay } from './poyaDays';

export interface ClockNow {
  date: string;     // 'YYYY-MM-DD' in campaign tz
  hour: number;     // 0-23 in campaign tz
  hourKey: string;  // 'YYYY-MM-DDTHH'
  weekday: number;  // 0 = Sunday … 6 = Saturday in campaign tz
}

/**
 * Returns the current date/hour/weekday in the given IANA timezone.
 * Cloud Functions runtime is UTC; we never trust local Date for window checks.
 */
export function nowIn(timezone: string): ClockNow {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const y = get('year');
  const mo = get('month');
  const d = get('day');
  const h = get('hour');
  const wkShort = get('weekday'); // 'Sun', 'Mon', ...
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wkShort);
  const hour = parseInt(h, 10);
  const date = `${y}-${mo}-${d}`;
  return { date, hour, hourKey: `${date}T${h}`, weekday };
}

export type SkipReason =
  | 'not_running'
  | 'outside_window'
  | 'sunday'
  | 'poya_day'
  | 'daily_cap_reached'
  | 'hourly_cap_reached'
  | 'random_jitter'
  | 'too_many_failures';

export interface PacerDecision {
  allow: boolean;
  reason?: SkipReason;
  now: ClockNow;
}

/**
 * Decides whether this tick is allowed to send a message.
 * Pure function — no Firestore, no side effects.
 */
export function shouldSendThisTick(
  campaign: OutreachCampaign,
  rand: () => number = Math.random,
): PacerDecision {
  const now = nowIn(campaign.timezone);

  if (campaign.status !== 'running') {
    return { allow: false, reason: 'not_running', now };
  }

  const {
    sendWindowStart,
    sendWindowEnd,
    dailyCap,
    perHourCap,
    skipTickProbability,
    skipSundays,
    skipPoyaDays,
  } = campaign.pacing;

  if (now.hour < sendWindowStart || now.hour >= sendWindowEnd) {
    return { allow: false, reason: 'outside_window', now };
  }

  if (skipSundays && now.weekday === 0) {
    return { allow: false, reason: 'sunday', now };
  }

  if (skipPoyaDays && isPoyaDay(now.date)) {
    return { allow: false, reason: 'poya_day', now };
  }

  const sentToday = campaign.sentToday?.[now.date] ?? 0;
  if (sentToday >= dailyCap) {
    return { allow: false, reason: 'daily_cap_reached', now };
  }

  const sentThisHour = campaign.sentHourly?.[now.hourKey] ?? 0;
  if (sentThisHour >= perHourCap) {
    return { allow: false, reason: 'hourly_cap_reached', now };
  }

  if (campaign.consecutiveFailures >= 5) {
    return { allow: false, reason: 'too_many_failures', now };
  }

  if (rand() < skipTickProbability) {
    return { allow: false, reason: 'random_jitter', now };
  }

  return { allow: true, now };
}
