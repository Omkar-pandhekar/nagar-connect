"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import FilterBar, { MapFilters } from "./FilterBar";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const MapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/omkar82080/cmgi97o1h003a01r5f890bztx",
      center: [75.3433139, 19.8761653],
      zoom: 12,
    });
    mapRef.current = map;

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const searchLocation = async (query: string) => {
    if (!query.trim() || !mapRef.current) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query.trim()
        )}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      if (!res.ok) throw new Error("Failed to search location");
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature?.center) {
        const [lng, lat] = feature.center as [number, number];
        mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });
      } else {
        setError("Location not found");
      }
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: MapFilters) => {
    console.log("Filters changed:", filters);
    // TODO: Apply filters to map markers
  };

  return (
    <div className="fixed inset-0">
      {/* Filter Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <FilterBar
          onLocationSearch={searchLocation}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
