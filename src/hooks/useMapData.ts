import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { FeatureCollection, Feature, Polygon, Point } from 'geojson';
import type { RegionProperties, POIProperties } from '../data/travelData';

export interface MapBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    zoom: number;
}

let cachedRegions: any[] | null = null;
let cachedMonthlyData: any[] | null = null;

export function useMapData(bounds: MapBounds | null) {
    // Arredondar os limites (bounds) para criar um grid de cache.
    // Isso evita requests no banco(Supabase) a cada pequeno movimento no mapa.
    const roundedBounds = bounds ? {
        minLat: Math.floor(bounds.minLat * 2) / 2, // blocos de 0.5 graus
        maxLat: Math.ceil(bounds.maxLat * 2) / 2,
        minLng: Math.floor(bounds.minLng * 2) / 2,
        maxLng: Math.ceil(bounds.maxLng * 2) / 2,
        zoom: Math.round(bounds.zoom)
    } : null;

    return useQuery({
        queryKey: ['mapData', roundedBounds],
        queryFn: async () => {
            // Fetch POIs (with spatial Bounding Box if provided)
            let poisQuery = supabase.from('pois').select('*');

            if (roundedBounds) {
                // Expanding the bounding box slightly helps pre-load POIs just outside view
                poisQuery = poisQuery
                    .gte('lat', roundedBounds.minLat)
                    .lte('lat', roundedBounds.maxLat)
                    .gte('lng', roundedBounds.minLng)
                    .lte('lng', roundedBounds.maxLng);

                // Zoom-based importance filtering:
                if (roundedBounds.zoom <= 3) {
                    poisQuery = poisQuery.lte('priority', 0); // Only massive global highlights
                } else if (roundedBounds.zoom <= 5) {
                    poisQuery = poisQuery.lte('priority', 2); // High priority highlights
                } else if (roundedBounds.zoom <= 8) {
                    poisQuery = poisQuery.lte('priority', 5); // Medium priorities
                }
                // Zoom > 8 brings all POIs
            }

            const { data: pois, error: poisError } = await poisQuery;
            if (poisError) throw poisError;

            // Fetch Regions - Cached in memory
            if (!cachedRegions) {
                const { data: regions, error: regionsError } = await supabase.from('regions').select('*');
                if (regionsError) throw regionsError;
                cachedRegions = regions;
            }

            // Fetch Region Monthly Data - Cached in memory
            if (!cachedMonthlyData) {
                const { data: monthlyData, error: monthlyError } = await supabase.from('region_monthly_data').select('*');
                if (monthlyError) throw monthlyError;
                cachedMonthlyData = monthlyData;
            }

            // Build POIs GeoJSON
            const poiFeatures: Feature<Point, POIProperties>[] = pois.map(poi => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [poi.lng, poi.lat]
                },
                properties: {
                    id: poi.id,
                    name: poi.name,
                    namePt: poi.name_pt || undefined,
                    description: poi.description,
                    descriptionPt: poi.description_pt || undefined,
                    bestTime: poi.best_time,
                    bestTimePt: poi.best_time_pt || undefined,
                    category: poi.category as any,
                    imageUrl: poi.image_url || undefined,
                    imageGallery: poi.image_gallery || undefined,
                    socialVideoUrl: poi.social_video_url || undefined,
                    caraiqbonito: poi.caraiqbonito,
                    priority: poi.priority
                }
            }));

            const poisGeoJSON: FeatureCollection<Point, POIProperties> = {
                type: "FeatureCollection",
                features: poiFeatures,
            };

            // Build Regions GeoJSON
            const regionFeatures: Feature<Polygon, RegionProperties>[] = cachedRegions.map(region => {
                // Find monthly data for this region
                const rmd = cachedMonthlyData!.filter(m => m.region_id === region.id);
                const monthlyDataObj: Record<number, any> = {};

                for (const data of rmd) {
                    monthlyDataObj[data.month] = {
                        weatherScore: data.weather_score,
                        costScore: data.cost_score,
                        recommendedScore: data.recommended_score,
                        weatherDesc: data.weather_desc,
                        weatherDescPt: data.weather_desc_pt || undefined,
                        avgDailyCost: data.avg_daily_cost,
                        highlights: data.highlights || [],
                        highlightsPt: data.highlights_pt || undefined,
                        whyVisit: data.why_visit,
                        whyVisitPt: data.why_visit_pt || undefined
                    };
                }

                return {
                    type: "Feature",
                    geometry: region.geometry_geojson as Polygon,
                    properties: {
                        id: region.id,
                        name: region.name,
                        namePt: region.name_pt || undefined,
                        country: region.country,
                        description: region.description,
                        descriptionPt: region.description_pt || undefined,
                        monthlyData: monthlyDataObj
                    }
                };
            });

            const regionsGeoJSON: FeatureCollection<Polygon, RegionProperties> = {
                type: "FeatureCollection",
                features: regionFeatures,
            };

            return {
                poisGeoJSON,
                regionsGeoJSON
            };
        },
        staleTime: 1000 * 60 * 60, // Aumentado para 1 hora de cache (React Query)
        refetchOnWindowFocus: false, // Evita requests ao mudar de aba
        refetchOnMount: false,
        refetchOnReconnect: false
    });
}
