import React, { useState } from 'react';
import {
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Star,
  Globe,
  MapPin,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import LeadCard from './LeadCard';
import SearchAutocomplete from './SearchAutocomplete';
import usePlacesSearch from '../hooks/usePlacesSearch';

const SearchView = ({ onAddToPipeline, savedLeadIds = [], onWhatsAppSent }) => {
  const [query, setQuery] = useState('');
  const { results, loading, error, searchPlaces, clearResults } = usePlacesSearch();

  const handleSearchSubmit = (q) => {
    if (q.trim()) searchPlaces(q);
  };

  const suggestions = [
    'Restaurants in Colombo',
    'Hotels in Kandy',
    'Cafes in Galle',
    'Beauty Salons in Colombo',
    'Gyms in Colombo',
  ];

  const criteria = [
    {
      icon: Star,
      title: 'Established',
      description: 'At least 10 Google reviews — proven foot traffic and demand',
      color: 'var(--warning)',
    },
    {
      icon: Globe,
      title: 'No website',
      description: 'Businesses without an online presence — your ideal client',
      color: 'var(--primary)',
    },
    {
      icon: MapPin,
      title: 'Operational',
      description: 'Currently open for business according to Google Places',
      color: 'var(--success)',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp-ready',
      description: 'Sri Lankan mobile number on file — direct outreach possible',
      color: 'var(--whatsapp)',
    },
  ];

  const hasResults = results.length > 0;
  const isEmpty = !hasResults && !loading && !error;

  return (
    <div
      className={`flex-1 flex flex-col min-h-0 ${isEmpty ? 'overflow-hidden h-screen' : 'overflow-auto'}`}
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <header
        className="px-6 lg:px-10 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight leading-tight">Find leads</h1>
          <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Search Google Places for businesses without websites
          </p>
        </div>
      </header>

      {/* Body */}
      <div className={`flex-1 flex flex-col ${isEmpty ? 'justify-center min-h-0' : ''}`}>

        {/* Hero search area */}
        <div className="px-6 lg:px-10 shrink-0">
          {!hasResults && !loading && (
            <div className="text-center mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--primary-soft)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-[26px] font-semibold tracking-tight mb-1.5 leading-tight">
                Find your next client
              </h2>
              <p className="text-[15px] max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Type a region and business category. We'll surface high-rating businesses without a website — ready for outreach.
              </p>
            </div>
          )}

          <div className={`flex gap-2 ${hasResults ? '' : 'max-w-2xl mx-auto'}`}>
            <SearchAutocomplete
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
              size={hasResults ? 'md' : 'lg'}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleSearchSubmit(query)}
              disabled={loading || !query.trim()}
              className={`btn-primary rounded-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${hasResults ? 'px-4 py-2.5 text-sm' : 'px-5 py-3 text-[15px]'}`}
            >
              {loading
                ? <Loader2 className={hasResults ? 'w-4 h-4 animate-spin' : 'w-5 h-5 animate-spin'} />
                : <SearchIcon className={hasResults ? 'w-4 h-4' : 'w-5 h-5'} />}
              Search
            </button>
          </div>

          {/* Suggested chips */}
          {!hasResults && !loading && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              <span className="text-[13px] mr-1" style={{ color: 'var(--text-muted)' }}>Popular:</span>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearchSubmit(s); }}
                  className="btn-ghost px-3 py-1.5 rounded-md text-[13px] font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Criteria grid */}
        {isEmpty && (
          <div className="px-6 lg:px-10 pb-8 mt-10 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Smart filtering — what every result has
              </span>
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {criteria.map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="surface rounded-xl p-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: 'var(--surface-elevated)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                    <h3 className="text-[15px] font-semibold mb-1">{c.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {c.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="text-[15px] mt-4" style={{ color: 'var(--text-secondary)' }}>
              Crawling Google Places…
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="px-6 lg:px-10 pt-6">
            <div
              className="rounded-lg p-4 flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
              <div className="text-sm">
                <p className="font-medium" style={{ color: 'var(--danger)' }}>Search failed</p>
                <p className="mt-0.5" style={{ color: 'rgba(248,113,113,0.7)' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <div className="px-6 lg:px-10 pt-6 pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">{results.length} qualified leads</h2>
              <button
                onClick={clearResults}
                className="text-xs hover:text-white transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Clear results
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {results.map(place => (
                <LeadCard
                  key={place.id || place.placeId}
                  place={place}
                  onAddToPipeline={onAddToPipeline}
                  isInPipeline={savedLeadIds.includes(place.placeId || place.id)}
                  onWhatsAppSent={onWhatsAppSent}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
