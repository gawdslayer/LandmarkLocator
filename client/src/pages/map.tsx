import { MapComponent } from "@/components/map-container";

export default function MapPage() {
  // Default to San Francisco coordinates
  const initialCenter: [number, number] = [37.7749, -122.4194];
  const initialZoom = 13;

  return (
    <div className="h-screen w-full">
      <MapComponent
        initialCenter={initialCenter}
        initialZoom={initialZoom}
      />
    </div>
  );
}
