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
  onToggleFavorites: () => void;
  filtersOpen: boolean;
  favoritesOpen: boolean;
}

export function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onCenterLocation, 
  onToggleFilters,
  onToggleFavorites,
  filtersOpen,
  favoritesOpen
}: MapControlsProps) {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
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
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Crosshair className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          )}
        </Button>
      </div>

      {/* Left Controls */}
      <div className="absolute top-20 left-4 z-20 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFilters}
          className={cn(
            "w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700",
            filtersOpen && "bg-primary/10 border-primary hover:bg-primary/20"
          )}
        >
          <Sliders className={cn(
            "h-4 w-4 text-slate-700 dark:text-slate-300",
            filtersOpen && "text-primary"
          )} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFavorites}
          className={cn(
            "w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 relative",
            favoritesOpen && "bg-primary/10 border-primary hover:bg-primary/20"
          )}
        >
          <Heart className={cn(
            "h-4 w-4 text-slate-700 dark:text-slate-300",
            favoritesOpen && "text-primary",
            favorites.length > 0 && "fill-red-500 text-red-500"
          )} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </div>
    </>
  );
}
