import { Button } from "@/components/ui/button";
import { Plus, Minus, Crosshair, Layers, Sliders, Moon, Sun, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/hooks/use-favorites";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterLocation: () => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
}

export function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onCenterLocation, 
  onToggleFilters,
  filtersOpen 
}: MapControlsProps) {
  return (
    <>
      {/* Main Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-lg hover:bg-slate-50"
        >
          <Plus className="h-4 w-4 text-slate-700" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-lg hover:bg-slate-50"
        >
          <Minus className="h-4 w-4 text-slate-700" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onCenterLocation}
          className="w-10 h-10 bg-white rounded-lg shadow-lg hover:bg-slate-50"
        >
          <Crosshair className="h-4 w-4 text-slate-700" />
        </Button>
      </div>

      {/* Filter Toggle */}
      <div className="absolute top-20 left-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFilters}
          className={cn(
            "w-10 h-10 bg-white rounded-lg shadow-lg hover:bg-slate-50",
            filtersOpen && "bg-primary/10 border-primary hover:bg-primary/20"
          )}
        >
          <Sliders className={cn(
            "h-4 w-4 text-slate-700",
            filtersOpen && "text-primary"
          )} />
        </Button>
      </div>
    </>
  );
}
