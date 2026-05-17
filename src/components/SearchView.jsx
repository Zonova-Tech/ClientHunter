import React, { useState } from 'react';
import { 
  Search as SearchIcon, 
  Loader2, 
  AlertCircle,
  Filter,
  Star,
  MapPin,
  Info
} from 'lucide-react';
import LeadCard from './LeadCard';
import usePlacesSearch from '../hooks/usePlacesSearch';

/**
 * SearchView Component
 * Search for potential leads using Google Places API
 */
const SearchView = ({ onAddToPipeline, savedLeadIds = [], onWhatsAppSent }) => {
  const [query, setQuery] = useState('');
  const { results, loading, error, rawResultsCount, searchPlaces, clearResults } = usePlacesSearch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchPlaces(query);
    }
  };

  const suggestedSearches = [
    'Restaurants in Colombo',
    'Hotels in Kandy',
    'Cafes in Galle',
    'Beauty Salons in Colombo',
    'Gyms in Colombo'
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-12 overflow-auto">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">
          Find Your Next <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">High-Value Client</span>
        </h1>

      </div>

      {/* Main Search Interface */}
      <div className="max-w-6xl mx-auto mb-10 sm:mb-16 px-0 sm:px-1">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-3xl blur opacity-30 group-focus-within:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 bg-slate-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] shadow-2xl">
            <div className="flex-1 relative flex items-center">
              <SearchIcon className="absolute left-5 sm:left-6 w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Region or Business type... (e.g., Colombo Restaurants)"
                className="w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 bg-transparent text-white text-base sm:text-lg lg:text-xl font-bold placeholder-slate-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              aria-label={loading ? 'Analyzing' : 'Execute search'}
              className="p-4 sm:p-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 disabled:from-slate-800 disabled:via-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center shadow-xl shadow-fuchsia-500/30 active:scale-95 w-full sm:w-auto"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
            </button>
          </div>
        </form>

        {/* Suggested Tags */}
        {results.length === 0 && !loading && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-fuchsia-300/70 uppercase tracking-widest mr-2">Example:</span>
            {suggestedSearches.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setQuery(suggestion); searchPlaces(suggestion); }}
                className="px-5 py-2.5 bg-white/5 hover:bg-gradient-to-r hover:from-violet-600/20 hover:to-fuchsia-600/20 text-slate-300 hover:text-white rounded-full text-xs font-black transition-all border border-white/10 hover:border-fuchsia-500/40 backdrop-blur-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto">
        {results.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  Analysis Results
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                    {results.length} Leads Verified
                  </span>
                </h2>
              </div>
              <button onClick={clearResults} className="text-xs font-black text-fuchsia-300/70 hover:text-fuchsia-200 uppercase tracking-widest transition-colors self-start sm:self-auto">
                Reset Workspace
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 pb-20">
              {results.map((place) => (
                <LeadCard
                  key={place.id || place.placeId}
                  place={place}
                  onAddToPipeline={onAddToPipeline}
                  isInPipeline={savedLeadIds.includes(place.placeId || place.id)}
                  onWhatsAppSent={onWhatsAppSent}
                />
              ))}
            </div>
          </>
        ) : !loading && !error && (
          <div className="glass-card p-6 sm:p-10 lg:p-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300">Smart Intelligence Filters</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Minimum 15 High-Quality Reviews', icon: Star, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-300' },
                    { label: 'No Existing Web Presence Verified', icon: Info, color: 'from-cyan-500/20 to-sky-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300' },
                    { label: 'Business Operational Status Confirmed', icon: MapPin, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
                    { label: 'Direct WhatsApp Communication Path', icon: SearchIcon, color: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-fuchsia-500/30', text: 'text-fuchsia-300' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-300 group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} border ${item.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-4 h-4 ${item.text}`} />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-pink-600/30 animate-pulse"></div>
                <div className="relative h-full w-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-violet-300">System Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error/Loading States */}
        {error && (
          <div className="bg-gradient-to-br from-rose-500/15 to-pink-500/10 border-2 border-rose-500/30 rounded-3xl p-8 mb-10 flex items-start gap-5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h4 className="text-xl font-black text-rose-300 mb-2 uppercase tracking-tighter">System Error Detected</h4>
              <p className="text-rose-200/90 font-bold leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500/30 blur-3xl rounded-full"></div>
              <Loader2 className="w-20 h-20 text-fuchsia-400 animate-spin relative" />
            </div>
            <h3 className="text-2xl font-black mt-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300">Engine Initialized</h3>
            <p className="text-slate-400 font-bold mt-2">Crawling database and applying filters...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
