// Google Maps JS SDK Loader & Places / Geocoding Utilities

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export interface GeocodedAddress {
  lat: number;
  lng: number;
  formattedAddress: string;
  locality: string;
  city: string;
  postalCode?: string;
  sublocality?: string;
}

// Fallback Default: Greater Noida Knowledge Park 3 (The Red Löffel base)
export const DEFAULT_MAP_CENTER = {
  lat: 28.4744,
  lng: 77.4917,
  address: "Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3",
  locality: "Knowledge Park 3",
  city: "Greater Noida",
};

let googleMapsPromise: Promise<any> | null = null;

/**
 * Dynamically loads Google Maps JavaScript SDK once with Places & Geometry libraries
 */
export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot load Google Maps on server"));
  }

  // Already loaded
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  // Already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if ((window as any).google && (window as any).google.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error("Google Maps failed to initialize"));
        }
      });
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyATmAbDRIRD7Zinh7csETemjGO--5_g6ck";

    (window as any).__googleMapsInit = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      }
    };

    const script = document.createElement("script");
    script.id = "google-maps-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly&loading=async&callback=__googleMapsInit`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Get place search predictions from Google Places Autocomplete API
 */
export async function getPlacePredictions(
  input: string,
  locationBias?: { lat: number; lng: number }
): Promise<PlacePrediction[]> {
  if (!input || input.trim().length < 2) return [];

  try {
    const maps = await loadGoogleMaps();
    const autocompleteService = new maps.places.AutocompleteService();

    const request: any = {
      input: input.trim(),
      componentRestrictions: { country: "in" }, // Focus on India
    };

    if (locationBias) {
      request.locationBias = {
        circle: {
          center: { lat: locationBias.lat, lng: locationBias.lng },
          radius: 15000, // 15km bias around Greater Noida
        },
      };
    }

    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(
        request,
        (predictions: any[], status: string) => {
          if (status !== maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }

          const results: PlacePrediction[] = predictions.map((pred) => ({
            placeId: pred.place_id,
            description: pred.description,
            mainText: pred.structured_formatting?.main_text || pred.description,
            secondaryText: pred.structured_formatting?.secondary_text || "",
          }));

          resolve(results);
        }
      );
    });
  } catch (error) {
    console.error("Error fetching place predictions:", error);
    return [];
  }
}

/**
 * Resolve Place ID to Latitude & Longitude using Geocoder
 */
export async function resolvePlaceId(
  placeId: string
): Promise<GeocodedAddress | null> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ placeId }, (results: any[], status: string) => {
        if (status !== "OK" || !results || results.length === 0) {
          resolve(null);
          return;
        }

        const res = results[0];
        const lat = res.geometry.location.lat();
        const lng = res.geometry.location.lng();
        const parsed = parseGeocodeResult(res, lat, lng);
        resolve(parsed);
      });
    });
  } catch (error) {
    console.error("Error resolving place ID:", error);
    return null;
  }
}

/**
 * Reverse Geocode Latitude & Longitude to a human readable street address
 */
export async function reverseGeocodeLatLng(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === "OK" && results && results.length > 0) {
            const parsed = parseGeocodeResult(results[0], lat, lng);
            resolve(parsed);
          } else {
            // Fallback if geocoding returns no results
            resolve({
              lat,
              lng,
              formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              locality: "Knowledge Park III",
              city: "Greater Noida",
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      lat,
      lng,
      formattedAddress: `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      locality: "Knowledge Park III",
      city: "Greater Noida",
    };
  }
}

/**
 * Helper to parse Google Geocode result into structured address fields
 */
function parseGeocodeResult(
  result: any,
  lat: number,
  lng: number
): GeocodedAddress {
  let locality = "";
  let sublocality = "";
  let city = "";
  let postalCode = "";

  const components = result.address_components || [];
  for (const comp of components) {
    const types = comp.types || [];
    if (types.includes("sublocality_level_1") || types.includes("sublocality")) {
      sublocality = comp.long_name;
    }
    if (types.includes("locality")) {
      locality = comp.long_name;
    }
    if (types.includes("administrative_area_level_2") && !city) {
      city = comp.long_name;
    }
    if (types.includes("postal_code")) {
      postalCode = comp.long_name;
    }
  }

  // Fallbacks for Greater Noida / Noida region
  const primaryLocality = sublocality || locality || "Knowledge Park III";
  const primaryCity = city || "Greater Noida";

  return {
    lat,
    lng,
    formattedAddress: result.formatted_address || `${primaryLocality}, ${primaryCity}`,
    locality: primaryLocality,
    sublocality,
    city: primaryCity,
    postalCode,
  };
}

/**
 * Retrieve user's current GPS location via Browser Geolocation API
 * Uses standard high-accuracy mode (15s timeout) like Swiggy / Google Maps
 */
export async function getCurrentGPSLocation(): Promise<{
  lat: number;
  lng: number;
  accuracy?: number;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        // Fallback to standard accuracy if high-accuracy timed out
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (err2) => {
            reject(err2 || err);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Generates a Google Maps Turn-by-Turn Navigation URL from Driver/Current Location to Customer Location.
 * Omitting the 'origin' parameter instructs Google Maps on mobile apps and browsers to automatically
 * use the driver's / device's live GPS position ("Your location") as the starting point, leading straight
 * to the customer's delivery destination.
 */
export function getGoogleMapsDirectionsUrl(address?: {
  lat?: number;
  lng?: number;
  house?: string;
  street?: string;
  landmark?: string;
  address?: string;
}): string {
  if (!address) return "https://www.google.com/maps";

  // If valid coordinates exist, route directly to the exact pin coordinates
  if (
    typeof address.lat === "number" &&
    typeof address.lng === "number" &&
    !isNaN(address.lat) &&
    !isNaN(address.lng) &&
    (address.lat !== 0 || address.lng !== 0)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`;
  }

  // Fallback to human readable location string
  const parts = [
    address.house,
    address.street,
    address.landmark ? `near ${address.landmark}` : "",
    address.address,
    "Knowledge Park 3, Greater Noida",
  ].filter(Boolean);

  const destinationQuery = parts.join(", ") || "Knowledge Park 3, Greater Noida";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
}


