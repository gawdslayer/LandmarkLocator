import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/types/landmark";

interface SearchHeaderProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
}

export function SearchHeader({ onLocationSelect, onToggleFilters, filtersOpen }: SearchHeaderProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/geocode', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json() as Promise<GeocodeResult[]>;
    },
    enabled: query.length >= 3
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowResults(query.length >= 3 && searchResults.length > 0);
  }, [query, searchResults]);

  const handleLocationClick = (result: GeocodeResult) => {
    setQuery(result.display_name.split(',')[0]); // Use first part of address
    setShowResults(false);
    onLocationSelect(result.lat, result.lng);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4">
      <div className="max-w-md mx-auto" ref={searchRef}>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search landmarks or places..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowResults(true)}
              className="pl-10 pr-12 py-3 border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0",
                filtersOpen && "bg-primary/10 text-primary"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {isLoading ? (
                <div className="p-3 text-sm text-slate-500 text-center">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationClick(result)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {result.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {result.display_name}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500 text-center">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
