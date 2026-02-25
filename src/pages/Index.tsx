import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { TravelMap } from "@/components/TravelMap";
import { MapControls } from "@/components/MapControls";
import { RegionSidebar } from "@/components/RegionSidebar";
import { POIModal } from "@/components/POIModal";
import { RoadmapModal } from "@/components/RoadmapModal";
import { useTheme } from "@/hooks/useTheme";
import { useMapData, type MapBounds } from "@/hooks/useMapData";
import type { ViewMode, RegionProperties, POIProperties } from "@/data/travelData";
import { Rocket, Loader2, User } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [viewMode, setViewMode] = useState<ViewMode>("recommended");
  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POIProperties | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [poiFilters, setPoiFilters] = useState<string[]>(["landmark", "nature", "culture", "beach", "city", "wonder", "natural_wonder"]);
  const [showRegions, setShowRegions] = useState(true);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  // Fetch geographical data
  const { data: mapData, isLoading, error } = useMapData(mapBounds);

  const handleRegionClick = useCallback((region: RegionProperties) => {
    setSelectedRegion(region);
    setSelectedPOI(null);
  }, []);

  const handlePOIClick = useCallback((poi: POIProperties) => {
    setSelectedPOI(poi);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-red-500">
        <p>Houve um erro ao carregar o mapa. Verifique sua conexão com o banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] glass-panel px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs font-semibold text-foreground">Buscando mapa...</span>
        </div>
      )}

      <TravelMap
        selectedMonth={selectedMonth}
        viewMode={viewMode}
        theme={theme}
        poiFilters={poiFilters}
        showRegions={showRegions}
        selectedRegion={selectedRegion}
        onRegionClick={handleRegionClick}
        onPOIClick={handlePOIClick}
        regionsGeoJSON={mapData?.regionsGeoJSON || { type: "FeatureCollection", features: [] }}
        poisGeoJSON={mapData?.poisGeoJSON || { type: "FeatureCollection", features: [] }}
        onBoundsChange={setMapBounds}
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

      <AnimatePresence mode="wait">
        {selectedRegion && (
          <RegionSidebar
            key="region-sidebar"
            region={selectedRegion}
            selectedMonth={selectedMonth}
            onClose={() => setSelectedRegion(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedPOI && (
          <POIModal key="poi-modal" poi={selectedPOI} onClose={() => setSelectedPOI(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showRoadmap && (
          <RoadmapModal key="roadmap-modal" isOpen={showRoadmap} onClose={() => setShowRoadmap(false)} />
        )}
      </AnimatePresence>

      {/* Roadmap button */}
      <motion.button
        onClick={() => setShowRoadmap(true)}
        className="absolute bottom-4 right-4 z-[1000] glass-panel rounded-full px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Rocket className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-semibold">Roadmap</span>
      </motion.button>

      {/* Profile button */}
      <Link to="/profile">
        <motion.button
          className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-full px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="w-3.5 h-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
          <span className="font-semibold">Passport</span>
        </motion.button>
      </Link>
    </div>
  );
};

export default Index;
