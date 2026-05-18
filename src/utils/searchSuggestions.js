// Sri Lankan business categories — order matters (most common first within rough groupings).
export const CATEGORIES = [
  'Restaurant', 'Cafe', 'Bakery', 'Bar', 'Fast Food',
  'Hotel', 'Lodging', 'Guest House', 'Resort',
  'Beauty Salon', 'Spa', 'Gym', 'Yoga Center',
  'Pharmacy', 'Dentist', 'Doctor', 'Hospital', 'Clinic',
  'Car Repair', 'Car Wash', 'Car Dealer', 'Auto Parts',
  'Clothing Store', 'Shoe Store', 'Jewelry Store',
  'Supermarket', 'Grocery Store', 'Convenience Store',
  'Bookstore', 'Stationery',
  'Real Estate Agent', 'Insurance Agent', 'Bank', 'ATM',
  'School', 'Tuition Class', 'University',
  'Tourist Attraction', 'Travel Agency',
  'Plumber', 'Electrician', 'Carpenter',
  'Photographer', 'Wedding Hall', 'Event Venue',
  'Software Company', 'IT Company', 'Printing Service',
  'Coworking Space',
];

// Common Sri Lankan locations — covers Greater Colombo, major cities, tourist spots.
export const LOCATIONS = [
  'Colombo',
  'Colombo 3 (Kollupitiya)', 'Colombo 4 (Bambalapitiya)',
  'Colombo 5 (Havelock Town)', 'Colombo 6 (Wellawatte)',
  'Colombo 7 (Cinnamon Gardens)', 'Colombo 8 (Borella)',
  'Dehiwala', 'Mount Lavinia', 'Nugegoda', 'Maharagama',
  'Kotte', 'Battaramulla', 'Rajagiriya',
  'Kandy', 'Peradeniya', 'Katugastota',
  'Galle', 'Hikkaduwa', 'Unawatuna',
  'Negombo', 'Wattala', 'Ja-Ela',
  'Matara', 'Weligama', 'Tangalle',
  'Jaffna', 'Anuradhapura', 'Polonnaruwa',
  'Trincomalee', 'Batticaloa',
  'Kurunegala', 'Ratnapura', 'Badulla', 'Nuwara Eliya',
  'Gampaha', 'Kalutara', 'Bandarawela', 'Ella',
];

const lc = (s) => s.toLowerCase();

/**
 * Given a raw query, returns suggestion buckets:
 *   - templates: ready-to-search "<Category>s in <Location>" strings (highest signal)
 *   - categories: bare category matches
 *   - locations: bare location matches
 * Order matches typical "fill in the blank" mental model.
 */
export function buildSuggestions(query) {
  const q = lc(query.trim());
  if (!q) return { templates: [], categories: [], locations: [] };

  // Detect "<something> in <something>" pattern — most useful for autocomplete.
  const inMatch = q.match(/^(.*?)\s+in\s+(.*)$/);
  let templates = [];
  if (inMatch) {
    const [, catPart, locPart] = inMatch;
    const cats = catPart
      ? CATEGORIES.filter(c => lc(c).includes(catPart)).slice(0, 3)
      : CATEGORIES.slice(0, 3);
    const locs = locPart
      ? LOCATIONS.filter(l => lc(l).includes(locPart)).slice(0, 3)
      : LOCATIONS.slice(0, 3);
    cats.forEach(cat => {
      locs.forEach(loc => {
        templates.push(`${pluralize(cat)} in ${stripParenthetical(loc)}`);
      });
    });
  } else {
    // No "in" yet — if the query matches a category, suggest a couple of popular locations.
    const matchedCat = CATEGORIES.find(c => lc(c).includes(q));
    if (matchedCat) {
      ['Colombo', 'Kandy', 'Galle'].forEach(loc => {
        templates.push(`${pluralize(matchedCat)} in ${loc}`);
      });
    }
  }

  const categories = CATEGORIES.filter(c => lc(c).includes(q)).slice(0, 5);
  const locations = LOCATIONS.filter(l => lc(l).includes(q)).slice(0, 5);

  return {
    templates: templates.slice(0, 4),
    categories,
    locations,
  };
}

function pluralize(word) {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z')) return word;
  return word + 's';
}

function stripParenthetical(s) {
  return s.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

export function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
