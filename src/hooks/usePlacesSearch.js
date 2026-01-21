import { useState, useCallback } from 'react';
import { filterSuitableLeads } from '../utils/leadUtils';

/**
 * Custom hook for Google Places API search
 * Uses the new Places API with TextSearch and Field Masking for cost optimization
 */
const usePlacesSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResultsCount, setRawResultsCount] = useState(0);

  /**
   * Search for places using Google Places API (New)
   * @param {string} query - Search query (e.g., "Restaurants in Colombo")
   */
  const searchPlaces = useCallback(async (query) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Check if Google Maps API is loaded
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error('Google Maps API not loaded. Please check your API key.');
      }

      // Create a PlacesService instance
      // We need a map or a div element for the service
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      // Define the request with field masking for cost optimization
      const request = {
        query: query,
        // Sri Lanka bounds for better results
        locationBias: {
          center: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
          radius: 150000 // 150km radius
        }
      };

      // Execute text search
      const searchResults = await new Promise((resolve, reject) => {
        service.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API Error: ${status}`));
          }
        });
      });

      // For each result, get detailed information with specific fields
      const detailedResults = await Promise.all(
        searchResults.slice(0, 20).map(place => getPlaceDetails(service, place.place_id))
      );

      // Filter out null results (failed detail fetches)
      const validResults = detailedResults.filter(place => place !== null);
      
      setRawResultsCount(validResults.length);

      // Apply our filtering logic
      const filteredLeads = filterSuitableLeads(validResults);
      
      setResults(filteredLeads);

      if (filteredLeads.length === 0 && validResults.length > 0) {
        setError(`Found ${validResults.length} businesses, but none match our criteria (no website, mobile phone, 10+ reviews)`);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get detailed place information
   * Uses field masking to only request necessary fields
   */
  const getPlaceDetails = async (service, placeId) => {
    const fields = [
      'place_id',
      'name',
      'rating',
      'user_ratings_total',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'business_status',
      'photos',
      'types',
      'formatted_address',
      'geometry'
    ];

    return new Promise((resolve) => {
      service.getDetails(
        { placeId, fields },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Map to our expected format
            resolve({
              id: place.place_id,
              placeId: place.place_id,
              displayName: place.name,
              rating: place.rating,
              userRatingCount: place.user_ratings_total,
              nationalPhoneNumber: place.formatted_phone_number,
              internationalPhoneNumber: place.international_phone_number,
              websiteUri: place.website,
              businessStatus: place.business_status,
              photos: place.photos,
              types: place.types,
              formattedAddress: place.formatted_address,
              location: place.geometry?.location
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  /**
   * Clear search results
   */
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
    clearResults
  };
};

export default usePlacesSearch;
