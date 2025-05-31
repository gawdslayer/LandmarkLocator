import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Navigation } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import type { Landmark } from "@/types/landmark";

interface FavoritesPanelProps {
  isOpen: boolean;
  onLandmarkClick: (landmark: Landmark) => void;
  onClose: () => void;
}

export function FavoritesPanel({ isOpen, onLandmarkClick, onClose }: FavoritesPanelProps) {
  const { favorites, removeFavorite } = useFavorites();

  if (!isOpen) return null;

  return (
    <div className="absolute top-32 left-4 z-20 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Saved Landmarks ({favorites.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 h-auto p-1"
        >
          ×
        </Button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-6">
          <Heart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No saved landmarks yet
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Click the heart icon on any landmark to save it
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((landmark) => (
            <div
              key={landmark.id}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer group"
              onClick={() => onLandmarkClick(landmark)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {landmark.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {landmark.description || "No description available"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {landmark.type}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {landmark.lat.toFixed(3)}, {landmark.lng.toFixed(3)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(landmark.id);
                    }}
                    className="w-6 h-6 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-3 w-3 fill-current" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="w-6 h-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}