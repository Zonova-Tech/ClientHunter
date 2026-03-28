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
const SearchView = ({ onAddToPipeline, savedLeadIds = [] }) => {
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
    <div className="flex-1 p-12 overflow-auto bg-slate-950">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Prospecting Engine</span>
          </div>
        </div>
        <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          Find Your Next <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">High-Value Client</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
          Uncover businesses with high engagement but no digital footprint. 
          The perfect leads for your agency, found in seconds.
        </p>
      </div>

      {/* Main Search Interface */}
      <div className="max-w-6xl mx-auto mb-16 px-1">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex gap-4 bg-slate-900 border-2 border-slate-800 p-2 rounded-[2rem] shadow-2xl">
            <div className="flex-1 relative flex items-center">
              <SearchIcon className="absolute left-6 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Region or Business type... (e.g., Colombo Restaurants)"
                className="w-full pl-16 pr-6 py-5 bg-transparent text-white text-xl font-bold placeholder-slate-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[1.5rem] font-black text-lg transition-all flex items-center gap-3 shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
              <span>{loading ? 'Analyzing...' : 'Execute Search'}</span>
            </button>
          </div>
        </form>

        {/* Suggested Tags */}
        {results.length === 0 && !loading && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Signals:</span>
            {suggestedSearches.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setQuery(suggestion); searchPlaces(suggestion); }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs font-black transition-all border border-slate-800 hover:border-slate-700"
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
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  Analysis Results
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold">
                    {results.length} Leads Verified
                  </span>
                </h2>
              </div>
              <button onClick={clearResults} className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                Reset Workspace
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              {results.map((place) => (
                <LeadCard
                  key={place.id || place.placeId}
                  place={place}
                  onAddToPipeline={onAddToPipeline}
                  isInPipeline={savedLeadIds.includes(place.placeId || place.id)}
                />
              ))}
            </div>
          </>
        ) : !loading && !error && (
          <div className="glass-card p-12 border-white/5">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black text-white mb-6">Smart Intelligence Filters</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Minimum 15 High-Quality Reviews', icon: Star },
                    { label: 'No Existing Web Presence Verified', icon: Info },
                    { label: 'Business Operational Status Confirmed', icon: MapPin },
                    { label: 'Direct WhatsApp Communication Path', icon: SearchIcon }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-400 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 animate-pulse"></div>
                <div className="relative h-full w-full bg-slate-900 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">System Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error/Loading States */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/20 rounded-3xl p-8 mb-10 flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="text-xl font-black text-red-500 mb-2 uppercase tracking-tighter">System Error Detected</h4>
              <p className="text-red-400/80 font-bold leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin relative" />
            </div>
            <h3 className="text-2xl font-black text-white mt-8 tracking-tighter">Engine Initialized</h3>
            <p className="text-slate-500 font-bold mt-2">Crawling database and applying filters...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
