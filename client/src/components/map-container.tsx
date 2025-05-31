import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds, Map as LeafletMap, divIcon, marker, DivIcon } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SearchHeader } from "./search-header";
import { FilterPanel } from "./filter-panel";
import { MapControls } from "./map-controls";
import { LandmarkSidebar } from "./landmark-sidebar";
import { FavoritesPanel } from "./favorites-panel";
import type { Landmark, MapBounds, FilterState } from "@/types/landmark";
import { LANDMARK_TYPES } from "@/types/landmark";
import "leaflet/dist/leaflet.css";

// Custom marker component
function LandmarkMarkers({ 
  landmarks, 
  onLandmarkClick,
  selectedTypes 
}: { 
  landmarks: Landmark[];
  onLandmarkClick: (landmark: Landmark) => void;
  selectedTypes: string[];
}) {
  const map = useMap();

  useEffect(() => {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof marker) {
        map.removeLayer(layer);
      }
    });

    // Filter landmarks by selected types
    const filteredLandmarks = landmarks.filter(landmark => 
      selectedTypes.length === 0 || selectedTypes.includes(landmark.type)
    );

    // Add new markers
    filteredLandmarks.forEach((landmark) => {
      const customIcon = divIcon({
        className: 'landmark-marker',
        html: '<div class="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">📍</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const markerInstance = marker([landmark.lat, landmark.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-slate-800 text-sm mb-1">${landmark.title}</h3>
            <p class="text-xs text-slate-600 mb-2">${landmark.type}</p>
            <button 
              onclick="window.selectLandmark(${landmark.id})"
              class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        `);

      // Store landmark data on marker for click handling
      (markerInstance as any)._landmarkData = landmark;
    });

    // Set up global function for popup button clicks
    (window as any).selectLandmark = (landmarkId: number) => {
      const landmark = landmarks.find(l => l.id === landmarkId);
      if (landmark) {
        onLandmarkClick(landmark);
      }
    };
  }, [landmarks, map, onLandmarkClick, selectedTypes]);

  return null;
}

// Map events component
function MapEvents({ 
  onBoundsChange 
}: { 
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const mapEventsRef = useRef<{ boundsChangeTimer?: NodeJS.Timeout }>({});

  const map = useMapEvents({
    moveend: () => {
      // Debounce bounds changes to avoid too many API calls
      if (mapEventsRef.current.boundsChangeTimer) {
        clearTimeout(mapEventsRef.current.boundsChangeTimer);
      }
      
      mapEventsRef.current.boundsChangeTimer = setTimeout(() => {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }, 1000); // Increased debounce to 1 second for better performance
    }
  });

  return null;
}

interface MapComponentProps {
  initialCenter: [number, number];
  initialZoom: number;
}

export function MapComponent({ initialCenter, initialZoom }: MapComponentProps) {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({
    isOpen: false,
    selectedTypes: []
  });
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const mapRef = useRef<LeafletMap>(null);
  const { toast } = useToast();

  // Fetch landmarks based on current map bounds
  const { data: landmarks = [], isLoading, error } = useQuery({
    queryKey: ['/api/landmarks/bounds', mapBounds],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      const response = await fetch(
        `/api/landmarks/bounds?north=${mapBounds.north}&south=${mapBounds.south}&east=${mapBounds.east}&west=${mapBounds.west}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch landmarks');
      }
      
      return response.json() as Promise<Landmark[]>;
    },
    enabled: !!mapBounds
  });

  // Show error toast when landmark fetch fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load landmarks",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleCenterLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location services to use this feature.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleToggleFilters = useCallback(() => {
    setFilterState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    setFavoritesOpen(false); // Close favorites when opening filters
  }, []);

  const handleToggleFavorites = useCallback(() => {
    setFavoritesOpen(prev => !prev);
    setFilterState(prev => ({ ...prev, isOpen: false })); // Close filters when opening favorites
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterState(prev => ({ ...prev, selectedTypes: [] }));
  }, []);

  const handleLandmarkClick = useCallback((landmark: Landmark) => {
    setSelectedLandmark(landmark);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedLandmark(null);
  }, []);

  // Calculate type counts for filter panel
  const typeCounts = landmarks.reduce((counts, landmark) => {
    counts[landmark.type] = (counts[landmark.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Filter landmarks for display count
  const filteredLandmarks = landmarks.filter(landmark => 
    filterState.selectedTypes.length === 0 || 
    filterState.selectedTypes.includes(landmark.type)
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container */}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="absolute inset-0 z-0"
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapEvents onBoundsChange={handleBoundsChange} />
        <LandmarkMarkers 
          landmarks={landmarks}
          onLandmarkClick={handleLandmarkClick}
          selectedTypes={filterState.selectedTypes}
        />
      </MapContainer>

      {/* Search Header */}
      <SearchHeader
        onLocationSelect={handleLocationSelect}
        onToggleFilters={handleToggleFilters}
        filtersOpen={filterState.isOpen}
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterLocation={handleCenterLocation}
        onToggleFilters={handleToggleFilters}
        onToggleFavorites={handleToggleFavorites}
        filtersOpen={filterState.isOpen}
        favoritesOpen={favoritesOpen}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterState.isOpen}
        selectedTypes={filterState.selectedTypes}
        onTypeToggle={handleTypeToggle}
        onClearAll={handleClearFilters}
        typeCounts={typeCounts}
      />

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={favoritesOpen}
        onLandmarkClick={handleLandmarkClick}
        onClose={() => setFavoritesOpen(false)}
      />

      {/* Landmark Sidebar */}
      <LandmarkSidebar
        landmark={selectedLandmark}
        onClose={handleCloseSidebar}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-slate-700 text-sm font-medium">Loading landmarks...</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-xs text-slate-600">
            {filteredLandmarks.length} landmarks found
          </span>
        </div>
      </div>
    </div>
  );
}
