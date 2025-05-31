import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Landmark } from "@/types/landmark";

interface LandmarkSidebarProps {
  landmark: Landmark | null;
  onClose: () => void;
  className?: string;
}

export function LandmarkSidebar({ landmark, onClose, className }: LandmarkSidebarProps) {
  if (!landmark) return null;

  const handleWikipediaClick = () => {
    if (landmark.wikipediaUrl) {
      window.open(landmark.wikipediaUrl, '_blank');
    }
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-slate-800 truncate pr-2">
          {landmark.title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-8 h-8 flex-shrink-0 rounded-lg hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-slate-500" />
        </Button>
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

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {landmark.opened && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Opened
                </h4>
                <p className="text-sm text-slate-800">{landmark.opened}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Type
              </h4>
              <p className="text-sm text-slate-800">{landmark.type}</p>
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
