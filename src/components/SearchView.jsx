import React, { useState } from 'react';
import { 
  Search as SearchIcon, 
  Loader2, 
  AlertCircle,
  Filter,
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

  // Suggested searches for Sri Lanka
  const suggestedSearches = [
    'Restaurants in Colombo',
    'Hotels in Kandy',
    'Cafes in Galle',
    'Beauty Salons in Colombo',
    'Gyms in Colombo',
    'Car Repair in Colombo'
  ];

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find Potential Clients</h1>
        <p className="text-slate-400">
          Search for businesses with high foot traffic but no website - your ideal prospects.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses... (e.g., 'Restaurants in Colombo')"
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Searches */}
      {results.length === 0 && !loading && !error && (
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Suggested searches for Sri Lanka:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  searchPlaces(suggestion);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Info Box */}
      {!loading && results.length === 0 && !error && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Smart Filtering Applied</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>✓ Minimum 10 reviews (established businesses)</li>
                <li>✓ No website (potential clients)</li>
                <li>✓ Mobile phone only (WhatsApp friendly)</li>
                <li>✓ Business is operational</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Search Error</p>
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results Stats */}
      {results.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              Found {results.length} Qualified Leads
            </h2>
            {rawResultsCount > results.length && (
              <span className="text-sm text-slate-500">
                (from {rawResultsCount} total results)
              </span>
            )}
          </div>
          <button
            onClick={clearResults}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((place) => (
            <LeadCard
              key={place.id || place.placeId}
              place={place}
              onAddToPipeline={onAddToPipeline}
              isInPipeline={savedLeadIds.includes(place.placeId || place.id)}
            />
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400">Searching for potential clients...</p>
          <p className="text-slate-500 text-sm mt-2">Applying smart filters</p>
        </div>
      )}

      {/* API Key Reminder */}
      {!loading && results.length === 0 && error && (
        <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium">Setup Required</p>
            <p className="text-amber-400/80 text-sm">
              Make sure you've added your Google Maps API Key in the index.html file and enabled the Places API in your Google Cloud Console.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
