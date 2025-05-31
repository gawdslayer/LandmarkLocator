import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDMARK_TYPES } from "@/types/landmark";

interface FilterPanelProps {
  isOpen: boolean;
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onClearAll: () => void;
  typeCounts: Record<string, number>;
}

export function FilterPanel({ 
  isOpen, 
  selectedTypes, 
  onTypeToggle, 
  onClearAll,
  typeCounts 
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-32 left-4 z-20 w-64 bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Filter Landmarks</h3>
      <div className="space-y-3">
        {LANDMARK_TYPES.map((type) => (
          <div key={type} className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer flex-1">
              <Checkbox
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => onTypeToggle(type)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-slate-700">{type}</span>
            </label>
            <span className="text-xs text-slate-500 ml-2">
              {typeCounts[type] || 0}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-primary hover:text-blue-700 h-auto p-0 font-medium"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
