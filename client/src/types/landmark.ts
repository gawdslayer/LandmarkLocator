export interface Landmark {
  id: number;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  type: string;
  wikipediaUrl?: string;
  wikipediaPageId?: number;
  imageUrl?: string;
  opened?: string;
  categories?: string[];
  createdAt?: Date;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeocodeResult {
  display_name: string;
  lat: number;
  lng: number;
  type: string;
  importance: number;
}

export interface SearchState {
  query: string;
  results: GeocodeResult[];
  isSearching: boolean;
}

export interface FilterState {
  isOpen: boolean;
  selectedTypes: string[];
}

export const LANDMARK_TYPES = [
  'Historical Sites',
  'Museums', 
  'Parks & Nature',
  'Architecture'
] as const;

export type LandmarkType = typeof LANDMARK_TYPES[number];
