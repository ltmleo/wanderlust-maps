import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TravelMap } from "@/components/TravelMap";
import { MapControls } from "@/components/MapControls";
import { RegionSidebar } from "@/components/RegionSidebar";
import { POIModal } from "@/components/POIModal";
import { RoadmapModal } from "@/components/RoadmapModal";
import { useTheme } from "@/hooks/useTheme";
import { useMapData } from "@/hooks/useMapData";
import type { ViewMode, RegionProperties, POIProperties } from "@/data/travelData";
import { Rocket, Loader2 } from "lucide-react";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [viewMode, setViewMode] = useState<ViewMode>("recommended");
  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POIProperties | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [poiFilters, setPoiFilters] = useState<string[]>(["landmark", "nature", "culture", "beach", "city", "wonder", "natural_wonder"]);
  const [showRegions, setShowRegions] = useState(true);

  // Fetch geographical data
  const { data: mapData, isLoading, error } = useMapData();

  const handleRegionClick = useCallback((region: RegionProperties) => {
    setSelectedRegion(region);
    setSelectedPOI(null);
  }, []);

  const handlePOIClick = useCallback((poi: POIProperties) => {
    setSelectedPOI(poi);
  }, []);

  if (isLoading || !mapData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Buscando regiões e locais no mundo todo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-red-500">
        <p>Houve um erro ao carregar o mapa. Verifique sua conexão com o banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <TravelMap
        selectedMonth={selectedMonth}
        viewMode={viewMode}
        theme={theme}
        poiFilters={poiFilters}
        showRegions={showRegions}
        selectedRegion={selectedRegion}
        onRegionClick={handleRegionClick}
        onPOIClick={handlePOIClick}
        regionsGeoJSON={mapData.regionsGeoJSON}
        poisGeoJSON={mapData.poisGeoJSON}
      />

      <MapControls
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        poiFilters={poiFilters}
        showRegions={showRegions}
        onToggleRegions={() => setShowRegions(!showRegions)}
        onTogglePoiFilter={(f) => setPoiFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
      />

      <AnimatePresence>
        {selectedRegion && (
          <RegionSidebar
            region={selectedRegion}
            selectedMonth={selectedMonth}
            onClose={() => setSelectedRegion(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPOI && (
          <POIModal poi={selectedPOI} onClose={() => setSelectedPOI(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <RoadmapModal isOpen={showRoadmap} onClose={() => setShowRoadmap(false)} />
      </AnimatePresence>

      {/* Roadmap button */}
      <button
        onClick={() => setShowRoadmap(true)}
        className="absolute bottom-4 right-4 z-[1000] glass-panel rounded-full px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all hover:shadow-lg"
      >
        <Rocket className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">Roadmap</span>
      </button>
    </div>
  );
};

export default Index;
