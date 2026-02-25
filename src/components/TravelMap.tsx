import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { FeatureCollection, Polygon, Point } from "geojson";
import {
  getRegionColor,
  POI_ICONS,
  type ViewMode,
  type RegionProperties,
  type POIProperties,
} from "@/data/travelData";
import { useTranslation } from "@/hooks/useTranslation";
import type { MapBounds } from "@/hooks/useMapData";

interface TravelMapProps {
  selectedMonth: number;
  viewMode: ViewMode;
  theme: "light" | "dark";
  poiFilters: string[];
  showRegions: boolean;
  selectedRegion: RegionProperties | null;
  onRegionClick: (region: RegionProperties) => void;
  onPOIClick: (poi: POIProperties) => void;
  regionsGeoJSON: FeatureCollection<Polygon, RegionProperties>;
  poisGeoJSON: FeatureCollection<Point, POIProperties>;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export function TravelMap({ selectedMonth, viewMode, theme, poiFilters, showRegions, selectedRegion, onRegionClick, onPOIClick, regionsGeoJSON, poisGeoJSON, onBoundsChange }: TravelMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const regionsLayerRef = useRef<L.GeoJSON | null>(null);
  const poisLayerRef = useRef<L.LayerGroup | null>(null);
  const { t, locale, formatCurrency } = useTranslation();

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

    // Trigger bounds updates 
    const triggerBoundsChange = () => {
      if (!onBoundsChange) return;

      const bounds = map.getBounds();
      if (!bounds || !bounds.isValid()) return;

      // Add padding: ~5 degrees (~500km) to pre-load POIs outside viewport for better UX when dragging
      const pad = 5;
      onBoundsChange({
        minLat: bounds.getSouth() - pad,
        maxLat: bounds.getNorth() + pad,
        minLng: bounds.getWest() - pad,
        maxLng: bounds.getEast() + pad,
        zoom: map.getZoom(),
      });
    };

    map.on('moveend', triggerBoundsChange);
    map.on('zoomend', triggerBoundsChange);

    // Initial fetch bounds after a tiny delay to ensure map container has initialized size
    setTimeout(triggerBoundsChange, 100);

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

    if (!showRegions) return;

    const layer = L.geoJSON(regionsGeoJSON, {
      style: (feature) => {
        if (!feature?.properties) return {};
        const color = getRegionColor(feature.properties as RegionProperties, selectedMonth, viewMode);
        return {
          fillColor: color,
          fillOpacity: 0.6,
          color: theme === 'dark' ? '#292524' : '#ffffff',
          weight: 1.5,
          opacity: 0.8,
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
        const name = locale === 'pt' && props.namePt ? props.namePt : props.name;
        if (data) {
          layer.bindTooltip(
            `<div style="text-align:center"><strong>${name}</strong><br/><span style="font-size:11px;opacity:0.8">${t("region.score")}: ${data.recommendedScore}/10 · ${formatCurrency(data.avgDailyCost)}/${t("region.day")}</span></div>`,
            { sticky: true, className: "custom-tooltip" }
          );
        }
      },
    });

    layer.addTo(map);
    regionsLayerRef.current = layer;
  }, [selectedMonth, viewMode, onRegionClick, showRegions, locale, formatCurrency, regionsGeoJSON, theme]);

  // Update POI markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (poisLayerRef.current) {
      map.removeLayer(poisLayerRef.current);
    }

    // Override the default icon cluster to show the highest priority POI icon
    const poiGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      iconCreateFunction: function (cluster: any) {
        const markers = cluster.getAllChildMarkers();
        let highestPriority = -999;
        let bestProps: POIProperties | null = null;

        markers.forEach((marker: any) => {
          const props = marker.options.poiProps as POIProperties;
          if (props && (props.priority || 0) > highestPriority) {
            highestPriority = props.priority || 0;
            bestProps = props;
          }
        });

        const customIconStr = bestProps ? (POI_ICONS[bestProps.category] || "📍") : "📍";

        return L.divIcon({
          html: `<div class="poi-marker-inner" style="position: relative;">
                   ${customIconStr}
                   <div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white;">
                     ${markers.length}
                   </div>
                 </div>`,
          className: "poi-marker cluster-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      }
    });

    poisGeoJSON.features.forEach((feature) => {
      const props = feature.properties;

      if (props.category && !poiFilters.includes(props.category)) return;

      const [lng, lat] = feature.geometry.coordinates;

      const customIconStr = POI_ICONS[props.category] || "📍";

      const badgeHtml = props.caraiqbonito
        ? `<div class="poi-badge">✓</div>`
        : '';

      const icon = L.divIcon({
        className: "poi-marker",
        html: `<div class="poi-marker-inner">${customIconStr}${badgeHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const name = locale === 'pt' && props.namePt ? props.namePt : props.name;
      const marker = L.marker([lat, lng], { icon, poiProps: props } as any);
      marker.bindTooltip(name, { direction: "top", offset: [0, -12] });
      marker.on("click", () => onPOIClick(props));
      marker.addTo(poiGroup);
    });

    poiGroup.addTo(map);
    poisLayerRef.current = poiGroup;
  }, [onPOIClick, poiFilters, locale, selectedMonth, viewMode, theme, poisGeoJSON]);

  // Fly to region when selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedRegion) return;

    const feature = regionsGeoJSON.features.find(
      (f) => f.properties.id === selectedRegion.id
    );

    if (feature) {
      const layer = L.geoJSON(feature);
      const bounds = layer.getBounds();
      map.flyToBounds(bounds, {
        paddingTopLeft: [0, 0],
        paddingBottomRight: [350, 0], // Offset for sidebar
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedRegion]);

  return <div ref={containerRef} className="w-full h-full" />;
}
