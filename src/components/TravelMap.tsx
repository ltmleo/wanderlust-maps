import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import {
  regionsGeoJSON,
  poisGeoJSON,
  getRegionColor,
  POI_ICONS,
  type ViewMode,
  type RegionProperties,
  type POIProperties,
} from "@/data/travelData";

interface TravelMapProps {
  selectedMonth: number;
  viewMode: ViewMode;
  theme: "light" | "dark";
  onRegionClick: (region: RegionProperties) => void;
  onPOIClick: (poi: POIProperties) => void;
}

export function TravelMap({ selectedMonth, viewMode, theme, onRegionClick, onPOIClick }: TravelMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const regionsLayerRef = useRef<L.GeoJSON | null>(null);
  const poisLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: true,
    });

    // Tile layer added separately so it can be swapped on theme change
    const tileUrl = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    const tile = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update tile layer on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;

    const tileUrl = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  // Update regions layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layer
    if (regionsLayerRef.current) {
      map.removeLayer(regionsLayerRef.current);
    }

    const layer = L.geoJSON(regionsGeoJSON, {
      style: (feature) => {
        if (!feature?.properties) return {};
        const color = getRegionColor(feature.properties as RegionProperties, selectedMonth, viewMode);
        return {
          fillColor: color,
          fillOpacity: 0.6,
          color: "hsl(38, 60%, 55%)",
          weight: 1.5,
          opacity: 0.6,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties as RegionProperties;
        
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 3, opacity: 1, fillOpacity: 0.8 });
            l.bringToFront();
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle({ weight: 1.5, opacity: 0.6, fillOpacity: 0.6 });
          },
          click: () => onRegionClick(props),
        });

        // Tooltip
        const data = props.monthlyData[selectedMonth];
        if (data) {
          layer.bindTooltip(
            `<div style="text-align:center"><strong>${props.name}</strong><br/><span style="font-size:11px;opacity:0.8">Score: ${data.recommendedScore}/10 · $${data.avgDailyCost}/day</span></div>`,
            { sticky: true, className: "custom-tooltip" }
          );
        }
      },
    });

    layer.addTo(map);
    regionsLayerRef.current = layer;
  }, [selectedMonth, viewMode, onRegionClick]);

  // Update POI markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (poisLayerRef.current) {
      map.removeLayer(poisLayerRef.current);
    }

    const poiGroup = L.layerGroup();

    poisGeoJSON.features.forEach((feature) => {
      const props = feature.properties;
      const [lng, lat] = feature.geometry.coordinates;

      const icon = L.divIcon({
        className: "poi-marker",
        html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));cursor:pointer;transition:transform 0.2s" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'">${POI_ICONS[props.category] || "📍"}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon });
      marker.bindTooltip(props.name, { direction: "top", offset: [0, -12] });
      marker.on("click", () => onPOIClick(props));
      marker.addTo(poiGroup);
    });

    poiGroup.addTo(map);
    poisLayerRef.current = poiGroup;
  }, [onPOIClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
