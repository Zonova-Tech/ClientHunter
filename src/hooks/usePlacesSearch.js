import { useState, useCallback, useEffect, useRef } from 'react';
import { filterSuitableLeads } from '../utils/leadUtils';

const usePlacesSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResultsCount, setRawResultsCount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const pendingRejectRef = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_key_here') {
      console.warn("⚠️ No Google Maps API Key found in .env");
      return;
    }

    // Fires when the key is blocked, invalid, or missing API permissions.
    // Rejects any in-progress search immediately instead of waiting for the timeout.
    window.gm_authFailure = () => {
      console.error("❌ Google Maps API authentication failure");
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('AUTH_FAILURE'));
        pendingRejectRef.current = null;
      }
    };

    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Prevent double-loading in React StrictMode: reuse an existing script tag.
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("✅ Google Maps Script Loaded");
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Google Maps script");
      setError("Failed to load Google Maps. Please check your internet connection.");
    };

    document.head.appendChild(script);
  }, []);

  const searchPlaces = useCallback(async (query) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const isMockMode = !apiKey || apiKey === 'your_google_maps_key_here';

    console.log(`🔍 Search requested for: ${query} (Mode: ${isMockMode ? 'DEMO' : 'LIVE'})`);
    setLoading(true);
    setError(null);
    setResults([]);

    // --- MOCK DATA FALLBACK ---
    if (isMockMode) {
      console.log("🛠️ Entering Demo Mode (No API Key detected)");

      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockData = [
        {
          id: 'mock1',
          placeId: 'mock1',
          displayName: 'Ocean View Restaurant',
          rating: 4.8,
          userRatingCount: 1240,
          nationalPhoneNumber: '077 123 4567',
          internationalPhoneNumber: '+94 77 123 4567',
          websiteUri: null,
          businessStatus: 'OPERATIONAL',
          leadScore: 'Hot',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Marine Drive, Colombo 03, Sri Lanka',
          category: 'Restaurant'
        },
        {
          id: 'mock2',
          placeId: 'mock2',
          displayName: 'Kandy Heritage Stay',
          rating: 4.5,
          userRatingCount: 850,
          nationalPhoneNumber: '081 223 4567',
          internationalPhoneNumber: '+94 81 223 4567',
          websiteUri: null,
          businessStatus: 'OPERATIONAL',
          leadScore: 'Hot',
          types: ['hotel', 'lodging'],
          formattedAddress: '45 Peradeniya Road, Kandy, Sri Lanka',
          category: 'Hotel'
        },
        {
          id: 'mock3',
          placeId: 'mock3',
          displayName: 'Galle Fort Cafe',
          rating: 4.2,
          userRatingCount: 420,
          nationalPhoneNumber: '091 323 4567',
          internationalPhoneNumber: '+94 91 323 4567',
          websiteUri: null,
          businessStatus: 'OPERATIONAL',
          leadScore: 'Warm',
          types: ['cafe', 'food'],
          formattedAddress: '12 Church Street, Galle Fort, Sri Lanka',
          category: 'Cafe'
        },
        {
          id: 'mock4',
          placeId: 'mock4',
          displayName: 'Negombo Fitness Hub',
          rating: 3.9,
          userRatingCount: 150,
          nationalPhoneNumber: '031 423 4567',
          internationalPhoneNumber: '+94 31 423 4567',
          websiteUri: null,
          businessStatus: 'OPERATIONAL',
          leadScore: 'Warm',
          types: ['gym', 'health'],
          formattedAddress: '88 Lewis Place, Negombo, Sri Lanka',
          category: 'Gym'
        },
        {
          id: 'mock5',
          placeId: 'mock5',
          displayName: 'Nuwaya Beauty Salon',
          rating: 4.1,
          userRatingCount: 65,
          nationalPhoneNumber: '011 523 4567',
          internationalPhoneNumber: '+94 11 523 4567',
          websiteUri: null,
          businessStatus: 'OPERATIONAL',
          leadScore: 'Cold',
          types: ['beauty_salon', 'health'],
          formattedAddress: '500 Havelock Road, Colombo 06, Sri Lanka',
          category: 'Beauty Salon'
        }
      ];

      const queryWords = query.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['and', 'the', 'for'].includes(w));

      let filteredMockData = mockData;
      if (queryWords.length > 0) {
        filteredMockData = mockData.filter(place => {
          const searchText = [
            place.displayName,
            place.formattedAddress,
            place.category,
            ...(place.types || [])
          ].filter(Boolean).join(' ').toLowerCase();

          return queryWords.every(word => {
            const singularWord = word.endsWith('s') ? word.slice(0, -1) : word;
            return searchText.includes(word) || searchText.includes(singularWord);
          });
        });

        if (filteredMockData.length === 0) {
          filteredMockData = mockData.filter(place => {
            const searchText = [
              place.displayName,
              place.formattedAddress,
              place.category,
              ...(place.types || [])
            ].filter(Boolean).join(' ').toLowerCase();

            return queryWords.some(word => {
              const singularWord = word.endsWith('s') ? word.slice(0, -1) : word;
              return searchText.includes(word) || searchText.includes(singularWord);
            });
          });
        }
      }

      setResults(filteredMockData);
      setRawResultsCount(filteredMockData.length);
      setLoading(false);
      console.log(`✅ Demo leads loaded successfully. Found ${filteredMockData.length} matches.`);
      return;
    }

    // --- LIVE GOOGLE MAPS EXECUTION (legacy Places API) ---
    try {
      if (!window.google?.maps?.places) {
        throw new Error('Google Maps API not yet initialized. Please wait a moment.');
      }

      console.log("📡 Initializing Places Service...");
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      const searchRequest = {
        query: query,
        location: new window.google.maps.LatLng(7.8731, 80.7718),
        radius: 50000
      };

      console.log("🛰️ Executing textSearch...");
      const allResults = await new Promise((resolve, reject) => {
        pendingRejectRef.current = reject;
        const timeout = setTimeout(() => {
          pendingRejectRef.current = null;
          reject(new Error('TIMEOUT'));
        }, 15000);

        service.textSearch(searchRequest, (results, status) => {
          clearTimeout(timeout);
          pendingRejectRef.current = null;
          console.log("🌐 Places API Status:", status);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK ||
            status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            resolve(results || []);
          } else {
            reject(new Error(status));
          }
        });
      });

      console.log(`✅ Found ${allResults.length} raw results`);
      setRawResultsCount(allResults.length);

      if (allResults.length === 0) {
        setResults([]);
        return;
      }

      console.log("🕵️ Fetching details for top results...");
      const detailedResults = await Promise.all(
        allResults.slice(0, 20).map(place => getPlaceDetails(service, place.place_id))
      );

      const validResults = detailedResults.filter(place => place !== null);
      console.log(`📊 Processing ${validResults.length} entries...`);
      const filteredLeads = filterSuitableLeads(validResults);

      console.log(`🎯 Filtering complete: ${filteredLeads.length} leads qualify`);
      setResults(filteredLeads);

      if (filteredLeads.length === 0 && validResults.length > 0) {
        setError(`Found ${validResults.length} businesses, but none match our criteria (established businesses with no website)`);
      }

    } catch (err) {
      console.error('💥 Search execution error:', err);
      const msg = err.message;

      if (msg === 'AUTH_FAILURE') {
        setError('Google Maps API key error: Enable "Maps JavaScript API" and "Places API" in Google Cloud Console. If the key has HTTP referrer restrictions, add http://localhost:5173/* to the allowed list.');
      } else if (msg === 'REQUEST_DENIED' || msg.includes('ApiNotActivated')) {
        setError('Google Maps API Error: Your key is either invalid or the Places API is not enabled in Google Cloud Console.');
      } else if (msg === 'OVER_QUERY_LIMIT') {
        setError('Google search limit reached. Please check your billing or try again later.');
      } else if (msg === 'TIMEOUT') {
        setError('Search timed out. This is usually caused by a blocked or misconfigured API key — check the Google Cloud Console.');
      } else {
        setError(`Search failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaceDetails = (service, placeId) => {
    const fields = [
      'place_id', 'name', 'rating', 'user_ratings_total',
      'formatted_phone_number', 'international_phone_number',
      'website', 'business_status', 'photos', 'types',
      'formatted_address', 'geometry'
    ];

    return new Promise((resolve) => {
      service.getDetails({ placeId, fields }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            id: place.place_id,
            placeId: place.place_id,
            displayName: place.name,
            rating: place.rating,
            userRatingCount: place.user_ratings_total,
            nationalPhoneNumber: place.formatted_phone_number,
            internationalPhoneNumber: place.international_phone_number,
            websiteUri: place.website ?? null,
            businessStatus: place.business_status,
            photos: place.photos,
            types: place.types,
            formattedAddress: place.formatted_address,
            location: place.geometry?.location
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setRawResultsCount(0);
  }, []);

  return {
    results,
    loading,
    error,
    rawResultsCount,
    searchPlaces,
    clearResults,
    isScriptLoaded
  };
};

export default usePlacesSearch;
