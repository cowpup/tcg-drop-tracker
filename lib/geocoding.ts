/**
 * Geocoding utility for converting addresses to lat/lng coordinates.
 * Uses Mapbox Geocoding API (free tier: 100k requests/month)
 */

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface MapboxFeature {
  center: [number, number]; // [lng, lat]
  place_name: string;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

/**
 * Geocode an address to lat/lng coordinates using Mapbox
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip?: string,
  country: string = "US"
): Promise<GeocodingResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    console.warn("NEXT_PUBLIC_MAPBOX_TOKEN not configured - geocoding disabled");
    return null;
  }

  // Build full address string
  const fullAddress = [address, city, state, zip, country]
    .filter(Boolean)
    .join(", ");

  try {
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=${country.toLowerCase()}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as MapboxResponse;

    if (!data.features || data.features.length === 0) {
      console.warn(`No geocoding results for: ${fullAddress}`);
      return null;
    }

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    return {
      lat,
      lng,
      formattedAddress: feature.place_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses (respects rate limits)
 */
export async function batchGeocode(
  addresses: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zip?: string;
    country?: string;
  }>
): Promise<Map<string, GeocodingResult | null>> {
  const results = new Map<string, GeocodingResult | null>();

  for (const addr of addresses) {
    const result = await geocodeAddress(
      addr.address,
      addr.city,
      addr.state,
      addr.zip,
      addr.country
    );
    results.set(addr.id, result);

    // Rate limiting: 10 requests per second max
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
