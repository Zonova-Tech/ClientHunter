import { getFirestore } from '../config/firebase';

export type MessageType = 'text' | 'image';
export type MessageStatus = 'success' | 'failed';

export interface MessageLogEntry {
  type: MessageType;
  status: MessageStatus;
  phone: string;
  message: string;
  imageUrl?: string;
  errorMessage?: string;
  source?: string;
  ip?: string;
  userAgent?: string;
}

export async function logMessageSend(entry: MessageLogEntry): Promise<void> {
  try {
    const db = getFirestore();
    const doc: Record<string, unknown> = {
      type: entry.type,
      status: entry.status,
      phone: entry.phone,
      message: entry.message,
      source: entry.source ?? 'clienthunter',
      createdAt: new Date(),
    };
    if (entry.imageUrl !== undefined) doc.imageUrl = entry.imageUrl;
    if (entry.errorMessage !== undefined) doc.errorMessage = entry.errorMessage;
    if (entry.ip !== undefined) doc.ip = entry.ip;
    if (entry.userAgent !== undefined) doc.userAgent = entry.userAgent;
    await db.collection('messageLog').add(doc);
  } catch (err) {
    console.error('[auditLog] Failed to write messageLog entry:', err);
  }
}
