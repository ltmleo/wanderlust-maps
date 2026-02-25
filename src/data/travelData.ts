import type { FeatureCollection, Feature, Polygon, Point } from "geojson";

export interface RegionProperties {
  id: string;
  name: string;
  namePt?: string;
  country: string;
  description: string;
  descriptionPt?: string;
  monthlyData: Record<number, {
    weatherScore: number;   // 1-10
    costScore: number;      // 1-10 (10 = cheapest)
    recommendedScore: number; // computed
    weatherDesc: string;
    weatherDescPt?: string;
    avgDailyCost: number;   // USD
    highlights: string[];
    highlightsPt?: string[];
    whyVisit: string;
    whyVisitPt?: string;
  }>;
}

export interface POIProperties {
  id: string;
  name: string;
  namePt?: string;
  description: string;
  descriptionPt?: string;
  bestTime: string;
  bestTimePt?: string;
  category: "landmark" | "nature" | "culture" | "beach" | "city" | "wonder" | "natural_wonder";
  imageUrl?: string;
  imageGallery?: string[];
  caraiqbonito?: boolean;
  priority?: number;
}

// Helper to compute recommended score
const computeRecommended = (weather: number, cost: number) =>
  Math.round((weather * 0.6 + cost * 0.4) * 10) / 10;

export type ViewMode = "weather" | "cost" | "recommended";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getRegionColor(region: RegionProperties, month: number, viewMode: ViewMode): string {
  const data = region.monthlyData[month];
  if (!data) return "hsl(222, 20%, 25%)";

  switch (viewMode) {
    case "weather": {
      const score = data.weatherScore;
      if (score >= 9) return "hsla(142, 76%, 45%, 0.7)";
      if (score >= 7) return "hsla(85, 65%, 50%, 0.65)";
      if (score >= 5) return "hsla(45, 90%, 55%, 0.6)";
      if (score >= 3) return "hsla(15, 80%, 50%, 0.6)";
      return "hsla(0, 75%, 50%, 0.6)";
    }
    case "cost": {
      const score = data.costScore;
      if (score >= 8) return "hsla(142, 76%, 45%, 0.7)";
      if (score >= 5) return "hsla(45, 90%, 55%, 0.6)";
      return "hsla(0, 75%, 50%, 0.6)";
    }
    case "recommended": {
      const score = data.recommendedScore;
      if (score >= 7.5) return "hsla(150, 80%, 45%, 0.75)"; // Emerald
      if (score >= 5.5) return "hsla(40, 90%, 55%, 0.7)"; // Amber
      return "hsla(0, 75%, 50%, 0.5)"; // Red
    }
  }
}

export const POI_ICONS: Record<string, string> = {
  landmark: "🏛️",
  nature: "🌿",
  culture: "⛩️",
  beach: "🏖️",
  city: "🏙️",
  wonder: "🌟",
  natural_wonder: "🌋",
};
