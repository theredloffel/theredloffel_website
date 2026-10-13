"use client";

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  Search,
  Crosshair,
  MapPin,
  X,
  Loader2,
  Navigation,
  Plus,
  Minus,
  Sparkles,
  Building,
  LocateFixed,
} from "lucide-react";
import {
  loadGoogleMaps,
  getPlacePredictions,
  resolvePlaceId,
  reverseGeocodeLatLng,
  getCurrentGPSLocation,
  DEFAULT_MAP_CENTER,
  PlacePrediction,
  GeocodedAddress,
} from "@/lib/googleMaps";

export interface GoogleMapViewRef {
  locateCurrentPosition: () => Promise<void>;
}

interface GoogleMapViewProps {
  initialLat?: number;
  initialLng?: number;
  onAddressSelect?: (address: GeocodedAddress) => void;
  className?: string;
  showSearchBar?: boolean;
  autoLocateIfGranted?: boolean;
}

export const GoogleMapView = forwardRef<GoogleMapViewRef, GoogleMapViewProps>(function GoogleMapView(
  {
    initialLat = DEFAULT_MAP_CENTER.lat,
    initialLng = DEFAULT_MAP_CENTER.lng,
    onAddressSelect,
    className = "h-[360px] sm:h-[400px]",
    showSearchBar = true,
    autoLocateIfGranted = true,
  },
  ref
) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  // Map state
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Address State
  const [currentAddress, setCurrentAddress] = useState<GeocodedAddress>({
    lat: initialLat,
    lng: initialLng,
    formattedAddress: DEFAULT_MAP_CENTER.address,
    locality: DEFAULT_MAP_CENTER.locality,
    city: DEFAULT_MAP_CENTER.city,
  });

  // Places Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep callback reference updated
  const onAddressSelectRef = useRef(onAddressSelect);
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  // Reverse geocode handler with debounce
  const handleCenterChanged = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const result = await reverseGeocodeLatLng(lat, lng);
      setCurrentAddress(result);
      if (onAddressSelectRef.current) {
        onAddressSelectRef.current(result);
      }
    } catch (e) {
      console.error("Geocoding failed:", e);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const [isBillingError, setIsBillingError] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const hasAutoLocatedRef = useRef(false);

  // GPS Locate Current Position
  const handleLocateMe = useCallback(async () => {
    setIsLocatingGPS(true);
    setGpsError(null);
    setGpsNotice(null);
    try {
      const pos = await getCurrentGPSLocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: pos.lat, lng: pos.lng });
        mapInstanceRef.current.setZoom(17);
        await handleCenterChanged(pos.lat, pos.lng);
      }
    } catch (err: any) {
      if (err?.code === 1) {
        setGpsError("Location access denied. Please click the site icon in your address bar and set Location to 'Allow'.");
      } else if (err?.code === 2) {
        setGpsError("Location unavailable on this Mac. Please check System Settings > Privacy > Location Services.");
      } else if (err?.code === 3) {
        setGpsError("Location timed out. Please click again or search your location above.");
      } else {
        setGpsError("Could not detect location. You can search your address directly above.");
      }
      setTimeout(() => setGpsError(null), 6000);
    } finally {
      setIsLocatingGPS(false);
    }
  }, [handleCenterChanged]);

  // Expose imperative handle for parents
  useImperativeHandle(ref, () => ({
    locateCurrentPosition: handleLocateMe,
  }));

  // Catch Google Maps Billing Authentication Failure
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).gm_authFailure = () => {
        setIsBillingError(true);
      };
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      try {
        const maps = await loadGoogleMaps();
        if (isCancelled || !mapContainerRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 16,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Listen for map drag events
        map.addListener("dragstart", () => {
          setIsDragging(true);
        });

        map.addListener("dragend", () => {
          setIsDragging(false);
          const center = map.getCenter();
          if (center) {
            handleCenterChanged(center.lat(), center.lng());
          }
        });

        // Trigger initial reverse geocoding
        handleCenterChanged(initialLat, initialLng);

        // Auto-locate once if user already granted permission previously
        if (
          autoLocateIfGranted &&
          !hasAutoLocatedRef.current &&
          typeof navigator !== "undefined" &&
          navigator.permissions?.query
        ) {
          hasAutoLocatedRef.current = true;
          navigator.permissions
            .query({ name: "geolocation" as any })
            .then((result) => {
              if (result.state === "granted" && !isCancelled) {
                handleLocateMe();
              }
            })
            .catch(() => { });
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to load Google Map:", err);
          setMapError("Could not load Google Maps. Please check network connection.");
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [initialLat, initialLng, handleCenterChanged, autoLocateIfGranted]);

  // Places Search debounce
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 2) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const center = mapInstanceRef.current
        ? {
          lat: mapInstanceRef.current.getCenter()?.lat() || initialLat,
          lng: mapInstanceRef.current.getCenter()?.lng() || initialLng,
        }
        : undefined;

      const results = await getPlacePredictions(val, center);
      setPredictions(results);
      setIsSearching(false);
    }, 280);
  };

  // Select place prediction
  const handleSelectPrediction = async (pred: PlacePrediction) => {
    setIsSearching(true);
    setIsSearchFocused(false);
    setSearchQuery(pred.mainText);
    setPredictions([]);

    try {
      const resolved = await resolvePlaceId(pred.placeId);
      if (resolved && mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: resolved.lat, lng: resolved.lng });
        mapInstanceRef.current.setZoom(17);
        setCurrentAddress(resolved);
        if (onAddressSelectRef.current) {
          onAddressSelectRef.current(resolved);
        }
      }
    } catch (e) {
      console.error("Failed to resolve prediction:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 16) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 16) - 1);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-[#E7E0D8] ${className}`}>
      {/* Search Bar & Auto-Suggestions Dropdown */}
      {showSearchBar && (
        <div className="absolute top-3 left-3 right-3 z-30 max-w-lg mx-auto">
          <div className="relative shadow-lg rounded-2xl bg-white/95 backdrop-blur-md border border-[#E7E0D8] transition-all">
            <div className="flex items-center px-3.5 py-2.5 gap-2.5">
              <Search className="w-4 h-4 text-[#C2410C] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search hostel, college, sector, or street..."
                className="w-full text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] bg-transparent outline-none font-medium"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#C2410C] animate-spin shrink-0" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPredictions([]);
                  }}
                  className="p-1 text-[#A8A29E] hover:text-[#1C1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Suggestions & Current Location Dropdown */}
            {isSearchFocused && (
              <div className="border-t border-[#E7E0D8] max-h-60 overflow-y-auto divide-y divide-[#F5EFEB] bg-white rounded-b-2xl shadow-xl">
                {/* 1. Instant Current Location Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchFocused(false);
                    handleLocateMe();
                  }}
                  className="w-full text-left px-3.5 py-3 hover:bg-[#F0FDF4] flex items-center gap-3 transition-colors group bg-emerald-50/60"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {isLocatingGPS ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#00875A] flex items-center gap-1.5">
                      <span>Use current location</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                        GPS
                      </span>
                    </p>
                    <p className="text-[11px] text-[#78716C]">
                      Automatically locate your current position on map
                    </p>
                  </div>
                </button>

                {/* 2. Predictions List */}
                {predictions.map((pred) => (
                  <button
                    key={pred.placeId}
                    type="button"
                    onClick={() => handleSelectPrediction(pred)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FFF7ED] flex items-start gap-2.5 transition-colors group"
                  >
                    <Building className="w-4 h-4 text-[#C2410C] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-[#1C1917] truncate">
                        {pred.mainText}
                      </p>
                      {pred.secondaryText && (
                        <p className="text-[11px] text-[#78716C] truncate">
                          {pred.secondaryText}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading Skeleton */}
      {!isMapReady && !mapError && (
        <div className="absolute inset-0 bg-[#F5EFEB] flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-8 h-8 text-[#C2410C] animate-spin" />
          <p className="text-xs font-semibold text-[#78716C] animate-pulse">
            Connecting to Live Google Maps...
          </p>
        </div>
      )}

      {/* Map Error Fallback */}
      {mapError && (
        <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-4 text-center z-10">
          <MapPin className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-xs font-semibold text-stone-800">{mapError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 rounded-full bg-[#C2410C] text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Center Fixed Pin (Swiggy / Zomato style with drag bounce) */}
      {isMapReady && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative -translate-y-5 flex flex-col items-center">
            {/* Top Prompt Tooltip */}
            <div
              className={`mb-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-md transition-all ${isDragging
                ? "bg-[#1C1917] text-white scale-105"
                : "bg-white text-[#C2410C] border border-orange-200"
                }`}
            >
              {isDragging ? "Drop Pin to Select" : "Order Delivered Here"}
            </div>

            {/* Pin Icon */}
            <div
              className={`transition-transform duration-200 ${isDragging ? "-translate-y-2.5 scale-110" : "translate-y-0"
                }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#C2410C] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#C2410C]/20">
                <MapPin className="w-5 h-5 fill-white text-[#C2410C]" />
              </div>
            </div>

            {/* Pin Shadow */}
            <div
              className={`w-3 h-1 bg-black/30 rounded-full blur-[1px] transition-all duration-200 mt-0.5 ${isDragging ? "scale-50 opacity-30" : "scale-100 opacity-70"
                }`}
            />
          </div>
        </div>
      )}

      {/* PROMINENT CENTER FLOATING BUTTON: "Use Current Location" (Swiggy / Zomato style) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocatingGPS}
          className="px-4 py-2.5 rounded-full bg-white text-[#00875A] border-2 border-[#00875A] hover:bg-emerald-50 active:scale-95 shadow-xl flex items-center gap-2 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap group"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-4 h-4 text-[#00875A] animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4 text-[#00875A] group-hover:rotate-45 transition-transform" />
          )}
          <span>{isLocatingGPS ? "Detecting GPS..." : "Use current location"}</span>
        </button>
      </div>

      {/* Floating Controls (GPS Locate Me + Zoom buttons on the right) */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-2">
        {/* GPS Locate Me Icon */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocatingGPS}
          title="Use current GPS location"
          className="w-10 h-10 rounded-full bg-white text-[#1C1917] hover:text-[#00875A] hover:border-[#00875A] shadow-lg border border-[#E7E0D8] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-5 h-5 text-[#00875A] animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5 text-[#00875A]" />
          )}
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-xl bg-white shadow-lg border border-[#E7E0D8] overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-9 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFEB] border-b border-[#E7E0D8] active:bg-[#E7E0D8]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-9 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFEB] active:bg-[#E7E0D8]"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Google Cloud Billing Error Notice */}
      {isBillingError && (
        <div className="absolute top-16 left-3 right-3 z-30 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-xl flex items-start gap-2.5 animate-in fade-in">
          <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
            !
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-xs text-amber-950">
              Google Maps Billing Needs Activation
            </p>
            <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
              Google requires linking a billing account to your project (includes $200 free credit/mo). You can still type and search hostels or streets directly in the search bar above.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBillingError(false)}
            className="p-1 hover:bg-amber-200/50 rounded-md text-amber-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* GPS Notice Toast */}
      {gpsNotice && (
        <div className="absolute top-16 left-3 right-3 z-30 px-3.5 py-2.5 rounded-xl bg-emerald-900/95 text-white text-xs font-semibold shadow-xl flex items-center justify-between animate-in fade-in backdrop-blur-xs">
          <span className="truncate pr-2">{gpsNotice}</span>
          <button
            type="button"
            onClick={() => setGpsNotice(null)}
            className="p-1 hover:bg-white/20 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* GPS Error Notice */}
      {gpsError && (
        <div className="absolute top-16 left-3 right-3 z-30 px-3.5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-xl flex items-center justify-between animate-in fade-in">
          <span className="truncate pr-2">{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="p-1 hover:bg-white/20 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mini status indicator at top-center */}
      {isGeocoding && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#1C1917]/90 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md backdrop-blur-xs">
          <Loader2 className="w-3 h-3 text-[#FED7AA] animate-spin" />
          <span>Pinning address...</span>
        </div>
      )}
    </div>
  );
});
