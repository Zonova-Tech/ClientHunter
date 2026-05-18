import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'clienthunter:recent-searches';
const MAX_ITEMS = 8;

/**
 * Persists recent search queries in localStorage so users can quickly re-run them.
 * Returns the most recent first, deduplicated case-insensitively.
 */
export default function useRecentSearches() {
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecents(parsed);
      }
    } catch {
      /* corrupted storage — ignore */
    }
  }, []);

  const addRecent = useCallback((query) => {
    const q = query?.trim();
    if (!q) return;
    setRecents(prev => {
      const filtered = prev.filter(r => r.query.toLowerCase() !== q.toLowerCase());
      const next = [{ query: q, ts: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const removeRecent = useCallback((query) => {
    setRecents(prev => {
      const next = prev.filter(r => r.query.toLowerCase() !== query.toLowerCase());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
