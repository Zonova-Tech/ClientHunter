import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search as SearchIcon, Clock, MapPin, Tag, Sparkles, X } from 'lucide-react';
import useRecentSearches from '../hooks/useRecentSearches';
import { buildSuggestions, formatTimeAgo } from '../utils/searchSuggestions';

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent || '');
const SHORTCUT_LABEL = isMac ? '⌘K' : 'Ctrl K';

/**
 * Search input with autocomplete dropdown, recent-search history, and ⌘K focus shortcut.
 *
 * Props:
 *  - value, onChange: controlled input value
 *  - onSubmit(query): called when user picks a suggestion or hits Enter with a non-empty query
 *  - size: 'lg' (hero) | 'md' (compact, in results view)
 *  - placeholder, disabled
 */
const SearchAutocomplete = ({
  value,
  onChange,
  onSubmit,
  size = 'lg',
  placeholder = 'Region or business type (e.g. Restaurants in Colombo)',
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches();

  // Build the flat list of items shown in the dropdown.
  const items = useMemo(() => {
    if (!value.trim()) {
      // Empty input → show recents
      return recents.slice(0, 6).map(r => ({
        kind: 'recent',
        label: r.query,
        meta: formatTimeAgo(r.ts),
        ts: r.ts,
      }));
    }
    const { templates, categories, locations } = buildSuggestions(value);
    const out = [];
    templates.forEach(t => out.push({ kind: 'template', label: t }));
    categories.forEach(c => out.push({ kind: 'category', label: c, meta: 'Category' }));
    locations.forEach(l => out.push({ kind: 'location', label: l, meta: 'Location' }));
    return out.slice(0, 10);
  }, [value, recents]);

  // Reset highlight when items change.
  useEffect(() => { setHighlight(0); }, [value, recents.length]);

  // Scroll highlighted item into view.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${highlight}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  // Global ⌘K / Ctrl+K shortcut to focus the input.
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const submitWith = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    onSubmit?.(trimmed);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight(i => Math.min(i + 1, Math.max(0, items.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && items[highlight]) {
        const picked = items[highlight].label;
        onChange(picked);
        submitWith(picked);
      } else if (value.trim()) {
        submitWith(value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (open) setOpen(false);
      else inputRef.current?.blur();
    }
  };

  const inputClass =
    size === 'lg'
      ? 'input w-full pr-24 pl-11 py-3 text-[15px]'
      : 'input w-full pr-20 pl-10 py-2.5 text-sm';
  const iconClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const iconLeftPos = size === 'lg' ? 'left-3.5' : 'left-3';

  const showClear = value.length > 0;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <SearchIcon
        className={`${iconClass} absolute ${iconLeftPos} top-1/2 -translate-y-1/2 pointer-events-none`}
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className={inputClass}
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {/* Right-side controls: clear button + ⌘K hint */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        {showClear && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(''); inputRef.current?.focus(); }}
            className="pointer-events-auto w-7 h-7 rounded-md flex items-center justify-center transition-colors border"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            aria-label="Clear search"
            title="Clear search"
            tabIndex={-1}
          >
            <X className="w-4 h-4" strokeWidth={2.25} />
          </button>
        )}
        <kbd
          className="hidden md:inline-flex items-center justify-center px-1.5 h-6 rounded text-[11px] font-mono font-medium border"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-muted)',
            borderColor: 'var(--border)',
          }}
        >
          {SHORTCUT_LABEL}
        </kbd>
      </div>

      {/* Dropdown */}
      {open && items.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 surface rounded-lg overflow-hidden shadow-2xl z-30 animate-fade-in max-h-[360px] overflow-y-auto"
        >
          {/* Section header for recents */}
          {!value.trim() && (
            <div
              className="flex items-center justify-between px-3 py-2 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
            >
              <span>Recent searches</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearRecents(); }}
                className="hover:text-white transition-colors normal-case tracking-normal text-[11px]"
              >
                Clear all
              </button>
            </div>
          )}

          {items.map((item, idx) => {
            const isActive = idx === highlight;
            return (
              <button
                key={`${item.kind}-${item.label}-${idx}`}
                data-idx={idx}
                type="button"
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  // mouseDown fires before blur so we don't lose focus → state
                  e.preventDefault();
                  onChange(item.label);
                  submitWith(item.label);
                }}
                className="w-full px-3 py-2 flex items-center gap-3 text-left text-sm transition-colors group"
                style={{
                  background: isActive ? 'var(--surface-elevated)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                <SuggestionIcon kind={item.kind} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.meta && (
                  <span
                    className="text-[11px] shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.meta}
                  </span>
                )}
                {item.kind === 'recent' && isActive && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeRecent(item.label);
                    }}
                    aria-label="Remove from recents"
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-700 shrink-0"
                  >
                    <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SuggestionIcon = ({ kind }) => {
  const cls = 'w-4 h-4 shrink-0';
  if (kind === 'recent') return <Clock className={cls} style={{ color: 'var(--text-muted)' }} />;
  if (kind === 'template') return <Sparkles className={cls} style={{ color: 'var(--primary)' }} />;
  if (kind === 'category') return <Tag className={cls} style={{ color: 'var(--warning)' }} />;
  if (kind === 'location') return <MapPin className={cls} style={{ color: 'var(--success)' }} />;
  return <SearchIcon className={cls} style={{ color: 'var(--text-muted)' }} />;
};

export default SearchAutocomplete;
