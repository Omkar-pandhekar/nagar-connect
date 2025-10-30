"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import FilterBar, { MapFilters } from "./FilterBar";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

// --- Add Type Definition for an Issue ---
// This should match the structure of your API response
interface FullIssue {
  _id: string;
  title: string;
  status: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const MapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({}); // Ref to store markers

  const [issues, setIssues] = useState<FullIssue[]>([]);
  const [filters, setFilters] = useState<MapFilters>({ category: 'all', status: 'all', priority: 'all' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Effect to initialize the map (your existing code) ---
  useEffect(() => {
    if (!mapboxgl.accessToken || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/omkar82080/cmgi97o1h003a01r5f890bztx", // Your custom style
      center: [75.3433, 19.8762], // Chhatrapati Sambhajinagar
      zoom: 12,
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // --- Effect to fetch issues whenever filters change (server-side filtering) ---
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '1000');
        if (filters.issueType && filters.issueType !== 'all') params.set('category', String(filters.issueType));
        if (filters.status && filters.status !== 'all') params.set('status', String(filters.status));
        if (filters.priority && filters.priority !== 'all') params.set('priority', String(filters.priority));

        const url = `/api/issues/get-all-issues?${params.toString()}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          const j = await response.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to fetch issues.');
        }
        const data = await response.json();
        setIssues(data.data || []);
      } catch (err) {
        setError((err as Error).message);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [filters.issueType, filters.status, filters.priority]);

  // --- Effect to update markers when issues change ---
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers from the map
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (issues.length === 0) return;

    // Create and add new markers for issues (already server-filtered)
    issues.forEach(issue => {
      if (!issue.location?.coordinates) return;

      // Create a custom popup for each marker
      const popupContent = `
        <div style="font-family: sans-serif; max-width: 200px;">
          <h3 style="font-weight: 700; margin: 0 0 5px;">${issue.title}</h3>
          <p style="margin: 0 0 3px;"><strong>Category:</strong> ${issue.category}</p>
          <p style="margin: 0 0 3px;"><strong>Status:</strong> <span style="text-transform: capitalize;">${issue.status}</span></p>
          <p style="margin: 0;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${issue.priority}</span></p>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        color: issue.status === 'resolved' ? '#22c55e' : '#f59e0b', // Green for resolved, amber for others
      })
        .setLngLat(issue.location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current!);

      // Store the marker in our ref object
      markersRef.current[issue._id] = marker;
    });

  }, [issues]); // Re-run this effect whenever issues change

  // --- Your existing location search function ---
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



  // --- Update handleFilterChange to set the filter state ---
  const handleFilterChange = (newFilters: MapFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters); // This will trigger the marker update effect
  };

  return (
    <div className="fixed inset-0">
      <div className="absolute top-0 left-0 right-0 z-20">
        <FilterBar
          onLocationSearch={searchLocation}
          onFilterChange={handleFilterChange}
        />
      </div>
      <div ref={mapContainerRef} className="h-full w-full" />
      {/* Loading & Error overlays */}
      {loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-white/90 px-3 py-1 text-sm shadow">
          Loading issues...
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-red-50 px-3 py-1 text-sm text-red-700 shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default MapPage;