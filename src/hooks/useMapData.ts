import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { FeatureCollection, Feature, Polygon, Point } from 'geojson';
import type { RegionProperties, POIProperties } from '../data/travelData';

export function useMapData() {
    return useQuery({
        queryKey: ['mapData'],
        queryFn: async () => {
            // Fetch POIs
            const { data: pois, error: poisError } = await supabase.from('pois').select('*');
            if (poisError) throw poisError;

            // Fetch Regions
            const { data: regions, error: regionsError } = await supabase.from('regions').select('*');
            if (regionsError) throw regionsError;

            // Fetch Region Monthly Data
            const { data: monthlyData, error: monthlyError } = await supabase.from('region_monthly_data').select('*');
            if (monthlyError) throw monthlyError;

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
                    caraiqbonito: poi.caraiqbonito
                }
            }));

            const poisGeoJSON: FeatureCollection<Point, POIProperties> = {
                type: "FeatureCollection",
                features: poiFeatures,
            };

            // Build Regions GeoJSON
            const regionFeatures: Feature<Polygon, RegionProperties>[] = regions.map(region => {
                // Find monthly data for this region
                const rmd = monthlyData.filter(m => m.region_id === region.id);
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
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
