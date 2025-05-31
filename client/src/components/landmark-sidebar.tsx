import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Heart, Share2, Navigation, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { calculateDistance, getCurrentLocation } from "@/lib/distance";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Landmark } from "@/types/landmark";

interface LandmarkSidebarProps {
  landmark: Landmark | null;
  onClose: () => void;
  className?: string;
}

export function LandmarkSidebar({ landmark, onClose, className }: LandmarkSidebarProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [distance, setDistance] = useState<{ distance: number; unit: string } | null>(null);

  // Always call hooks before any early returns
  useEffect(() => {
    if (!landmark) return;
    
    const updateDistance = async () => {
      try {
        const userLocation = await getCurrentLocation();
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          landmark.lat,
          landmark.lng
        );
        setDistance(dist);
      } catch (error) {
        setDistance(null);
      }
    };

    updateDistance();
  }, [landmark]);

  if (!landmark) return null;

  const handleWikipediaClick = () => {
    if (landmark.wikipediaUrl) {
      window.open(landmark.wikipediaUrl, '_blank');
    }
  };

  const handleFavoriteClick = () => {
    toggleFavorite(landmark);
    toast({
      title: isFavorite(landmark.id) ? "Removed from favorites" : "Added to favorites",
      description: landmark.title,
    });
  };

  const handleShareClick = () => {
    const url = `${window.location.origin}/?landmark=${landmark.id}&lat=${landmark.lat}&lng=${landmark.lng}`;
    
    if (navigator.share) {
      navigator.share({
        title: landmark.title,
        text: landmark.description || `Check out ${landmark.title}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link copied",
          description: "Landmark link copied to clipboard",
        });
      });
    }
  };

  const handleDirectionsClick = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0 md:right-auto md:top-0 md:w-96 z-20 bg-white md:shadow-xl transform transition-transform duration-300",
      "translate-y-0 md:translate-y-0 md:translate-x-0",
      className
    )}>
      {/* Mobile handle */}
      <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
          {landmark.title}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Heart className={cn(
              "h-4 w-4",
              isFavorite(landmark.id) 
                ? "fill-red-500 text-red-500" 
                : "text-slate-500 dark:text-slate-400"
            )} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareClick}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Share2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 md:max-h-full overflow-y-auto">
        {/* Landmark Image */}
        {landmark.imageUrl && (
          <img 
            src={landmark.imageUrl}
            alt={landmark.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}

        {/* Landmark Info */}
        <div className="space-y-4">
          {landmark.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">About</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {landmark.description}
              </p>
            </div>
          )}

          {/* Quick Facts Panel */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quick Facts
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Type
                </h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{landmark.type}</p>
              </div>
              
              {distance && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Distance
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {distance.distance} {distance.unit}
                  </p>
                </div>
              )}
              
              {landmark.opened && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Opened
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{landmark.opened}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Coordinates
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {landmark.lat.toFixed(4)}, {landmark.lng.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDirectionsClick}
                className="flex-1 text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Directions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWikipediaClick}
                className="flex-1 text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                Wikipedia
              </Button>
            </div>
          </div>

          {/* Categories */}
          {landmark.categories && landmark.categories.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {landmark.categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Wikipedia Link */}
          {landmark.wikipediaUrl && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWikipediaClick}
                className="w-full justify-center gap-2"
              >
                <span>Read more on Wikipedia</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
