import type { FeatureCollection, Feature, Polygon, Point } from "geojson";

export interface RegionProperties {
  id: string;
  name: string;
  country: string;
  description: string;
  monthlyData: Record<number, {
    weatherScore: number;   // 1-10
    costScore: number;      // 1-10 (10 = cheapest)
    recommendedScore: number; // computed
    weatherDesc: string;
    avgDailyCost: number;   // USD
    highlights: string[];
    whyVisit: string;
  }>;
}

export interface POIProperties {
  id: string;
  name: string;
  description: string;
  bestTime: string;
  category: "landmark" | "nature" | "culture" | "beach";
  imageUrl?: string;
}

// Helper to compute recommended score
const computeRecommended = (weather: number, cost: number) =>
  Math.round((weather * 0.6 + cost * 0.4) * 10) / 10;

// --- REGIONS ---
const regionFeatures: Feature<Polygon, RegionProperties>[] = [
  // Northeast Brazil
  {
    type: "Feature",
    properties: {
      id: "ne-brazil",
      name: "Northeast Brazil",
      country: "Brazil",
      description: "Tropical paradise with stunning beaches, vibrant culture, and year-round warmth. Home to Salvador, Recife, and the stunning Lençóis Maranhenses dunes.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isWet = [3, 4, 5, 6, 7].includes(month);
          const weather = isWet ? 5 : 9;
          const cost = [1, 2, 7, 12].includes(month) ? 4 : 8;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isWet ? "Rainy season with occasional showers" : "Warm and sunny, perfect beach weather",
            avgDailyCost: [1, 2, 7, 12].includes(month) ? 120 : 65,
            highlights: isWet
              ? ["Indoor cultural attractions", "Fewer crowds", "Lush landscapes"]
              : ["Beach activities", "Carnival vibes", "Water sports"],
            whyVisit: isWet
              ? "Lower prices and fewer tourists, but expect rain. Great for cultural exploration."
              : "Perfect weather for beaches and outdoor adventures. Peak tropical paradise experience.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-47, -2], [-35, -3], [-34.5, -8], [-35, -13], [-38, -15], [-42, -14], [-45, -10], [-47, -5], [-47, -2]
      ]],
    },
  },
  // Southern Brazil
  {
    type: "Feature",
    properties: {
      id: "s-brazil",
      name: "Southern Brazil",
      country: "Brazil",
      description: "European-influenced region with temperate climate, wine country, dramatic canyons, and the thundering Iguazu Falls.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isSummer = [12, 1, 2, 3].includes(month);
          const isWinter = [6, 7, 8].includes(month);
          const weather = isSummer ? 8 : isWinter ? 5 : 7;
          const cost = isSummer ? 5 : 8;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isSummer ? "Warm summer, great for waterfalls" : isWinter ? "Cool winter, wine season" : "Mild and pleasant",
            avgDailyCost: isSummer ? 100 : 55,
            highlights: isSummer
              ? ["Iguazu Falls at peak flow", "Beach towns", "Outdoor hiking"]
              : isWinter
                ? ["Wine tasting in Vale dos Vinhedos", "Chocolate festivals", "Cozy mountain towns"]
                : ["Canyon trekking", "Cultural events", "Moderate crowds"],
            whyVisit: isSummer
              ? "Peak season for waterfalls and outdoor adventures. Warm and vibrant."
              : isWinter
                ? "Wine country at its finest. Cozy European-style towns with excellent food."
                : "Shoulder season offers great value with pleasant weather.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-54, -22], [-48, -22], [-47, -24], [-48, -29], [-50, -30], [-54, -28], [-55, -25], [-54, -22]
      ]],
    },
  },
  // Southern Europe (Mediterranean)
  {
    type: "Feature",
    properties: {
      id: "s-europe",
      name: "Southern Europe",
      country: "Mediterranean",
      description: "The sun-drenched Mediterranean coast spanning Spain, southern France, Italy, and Greece. Ancient ruins, world-class cuisine, and azure seas.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isSummer = [6, 7, 8].includes(month);
          const isShoulder = [4, 5, 9, 10].includes(month);
          const weather = isSummer ? 9 : isShoulder ? 8 : 4;
          const cost = isSummer ? 3 : isShoulder ? 7 : 9;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isSummer ? "Hot Mediterranean summer, clear skies" : isShoulder ? "Warm and pleasant, ideal for sightseeing" : "Cool and rainy, but charming",
            avgDailyCost: isSummer ? 180 : isShoulder ? 110 : 70,
            highlights: isSummer
              ? ["Island hopping", "Beach clubs", "Open-air festivals"]
              : isShoulder
                ? ["Museum visits without crowds", "Perfect hiking weather", "Local food festivals"]
                : ["Christmas markets", "Ski resorts nearby", "Truffle season"],
            whyVisit: isSummer
              ? "Peak Mediterranean experience but very crowded and expensive."
              : isShoulder
                ? "The sweet spot — great weather, fewer crowds, better prices."
                : "Off-season charm with the lowest prices and authentic local experiences.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-10, 36], [0, 36], [10, 37], [20, 35], [28, 36], [28, 42], [20, 42], [10, 44], [3, 44], [-5, 43], [-10, 42], [-10, 36]
      ]],
    },
  },
  // Southeast Asia
  {
    type: "Feature",
    properties: {
      id: "se-asia",
      name: "Southeast Asia",
      country: "Various",
      description: "Exotic temples, pristine beaches, incredible street food, and lush jungles across Thailand, Vietnam, Cambodia, and Indonesia.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isDry = [11, 12, 1, 2, 3].includes(month);
          const weather = isDry ? 9 : 4;
          const cost = [12, 1, 2].includes(month) ? 5 : 9;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isDry ? "Dry season, warm and sunny" : "Monsoon season with heavy rains",
            avgDailyCost: [12, 1, 2].includes(month) ? 80 : 40,
            highlights: isDry
              ? ["Temple exploration", "Beach paradise", "Island diving"]
              : ["Lush green landscapes", "Incredible deals", "Fewer tourists"],
            whyVisit: isDry
              ? "Perfect tropical weather for beaches and temples. Peak travel season."
              : "Budget-friendly with dramatic landscapes, but expect daily rain.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [95, 5], [108, 5], [120, 0], [120, 10], [115, 15], [108, 22], [100, 22], [95, 15], [95, 5]
      ]],
    },
  },
  // Western USA
  {
    type: "Feature",
    properties: {
      id: "w-usa",
      name: "Western United States",
      country: "USA",
      description: "From California's Pacific coast to the Grand Canyon, Yellowstone, and the Rocky Mountains. Epic road trip territory.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isSummer = [6, 7, 8].includes(month);
          const isShoulder = [4, 5, 9, 10].includes(month);
          const weather = isSummer ? 9 : isShoulder ? 7 : 5;
          const cost = isSummer ? 3 : isShoulder ? 6 : 8;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isSummer ? "Hot and dry, perfect for national parks" : isShoulder ? "Mild temps, some parks still accessible" : "Cold in mountains, mild on coast",
            avgDailyCost: isSummer ? 200 : isShoulder ? 140 : 100,
            highlights: isSummer
              ? ["National park road trips", "Pacific Coast Highway", "Music festivals"]
              : isShoulder
                ? ["Fall foliage", "Wine country harvest", "Cooler hiking"]
                : ["Ski season", "Desert warmth in Arizona", "Whale watching"],
            whyVisit: isSummer
              ? "All parks open, endless outdoor activities, but peak prices."
              : isShoulder
                ? "Great balance of weather, crowds, and pricing."
                : "Ski resorts and desert escapes at lower costs.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-125, 32], [-115, 32], [-104, 37], [-104, 49], [-125, 49], [-125, 42], [-125, 32]
      ]],
    },
  },
  // Japan
  {
    type: "Feature",
    properties: {
      id: "japan",
      name: "Japan",
      country: "Japan",
      description: "A mesmerizing blend of ancient traditions and futuristic cities. Cherry blossoms, hot springs, incredible cuisine, and serene temples.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isCherry = [3, 4].includes(month);
          const isAutumn = [10, 11].includes(month);
          const isRainy = [6, 7].includes(month);
          const weather = isCherry || isAutumn ? 10 : isRainy ? 4 : 7;
          const cost = isCherry ? 2 : isAutumn ? 3 : isRainy ? 8 : 6;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isCherry ? "Cherry blossom season, mild and magical" : isAutumn ? "Stunning fall foliage" : isRainy ? "Rainy season (tsuyu)" : "Variable but comfortable",
            avgDailyCost: isCherry ? 220 : isAutumn ? 200 : isRainy ? 120 : 160,
            highlights: isCherry
              ? ["Hanami festivals", "Temple visits", "Perfect photography"]
              : isAutumn
                ? ["Momiji (maple viewing)", "Hot springs", "Harvest cuisine"]
                : isRainy
                  ? ["Museum season", "Indoor markets", "Hydrangea viewing"]
                  : ["Ski season (winter)", "Summer festivals", "Hiking"],
            whyVisit: isCherry
              ? "The most magical time to visit Japan. Book far in advance."
              : isAutumn
                ? "Equally stunning as spring with fiery autumn colors and fewer crowds."
                : isRainy
                  ? "Lowest prices but expect persistent rain. Great for food-focused trips."
                  : "Solid all-around experience with varied activities.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [129, 30], [132, 32], [135, 33], [140, 35], [142, 39], [145, 44], [143, 45], [140, 43], [137, 38], [135, 35], [131, 33], [129, 31], [129, 30]
      ]],
    },
  },
  // East Africa
  {
    type: "Feature",
    properties: {
      id: "e-africa",
      name: "East Africa",
      country: "Kenya / Tanzania",
      description: "The ultimate safari destination. Witness the Great Migration, climb Kilimanjaro, and experience diverse wildlife on the Serengeti plains.",
      monthlyData: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isDry = [6, 7, 8, 9, 10, 1, 2].includes(month);
          const isMigration = [7, 8, 9].includes(month);
          const weather = isDry ? (isMigration ? 10 : 8) : 4;
          const cost = isMigration ? 2 : isDry ? 5 : 8;
          return [month, {
            weatherScore: weather,
            costScore: cost,
            recommendedScore: computeRecommended(weather, cost),
            weatherDesc: isMigration ? "Dry season, Great Migration crossing the Mara" : isDry ? "Dry and pleasant for safaris" : "Long rains, some lodges close",
            avgDailyCost: isMigration ? 350 : isDry ? 250 : 150,
            highlights: isMigration
              ? ["Great Migration river crossings", "Peak wildlife viewing", "Hot air balloon safaris"]
              : isDry
                ? ["Safari game drives", "Kilimanjaro climbing", "Beach extensions to Zanzibar"]
                : ["Bird watching", "Green season photography", "Budget safaris"],
            whyVisit: isMigration
              ? "The greatest wildlife spectacle on Earth. Worth every penny."
              : isDry
                ? "Excellent safari conditions with good visibility and active wildlife."
                : "Green season offers dramatic landscapes and baby animals at lower cost.",
          }];
        })
      ),
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [29, -1], [34, -1], [41, -2], [41, -8], [40, -11], [35, -11], [29, -5], [29, -1]
      ]],
    },
  },
];

// --- POINTS OF INTEREST ---
const poiFeatures: Feature<Point, POIProperties>[] = [
  {
    type: "Feature",
    properties: {
      id: "poi-iguazu",
      name: "Iguazu Falls",
      description: "One of the world's largest waterfall systems, straddling the border of Argentina and Brazil. Over 275 individual drops spanning nearly 3km.",
      bestTime: "November to March (summer) for peak water flow. Early morning for fewer crowds and rainbows.",
      category: "nature",
    },
    geometry: { type: "Point", coordinates: [-54.44, -25.69] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-colosseum",
      name: "The Colosseum",
      description: "Ancient Rome's iconic amphitheater, built in 80 AD. This architectural marvel once held 50,000 spectators for gladiatorial contests.",
      bestTime: "Early morning or late afternoon to avoid crowds. April-May and September-October for ideal weather.",
      category: "landmark",
    },
    geometry: { type: "Point", coordinates: [12.49, 41.89] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-santorini",
      name: "Santorini",
      description: "Stunning Greek island famous for its white-washed buildings with blue domes perched on dramatic cliffs overlooking the Aegean Sea.",
      bestTime: "Sunset from Oia village. Late April-June or September-October to avoid peak summer crowds.",
      category: "beach",
    },
    geometry: { type: "Point", coordinates: [25.43, 36.39] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-angkorwat",
      name: "Angkor Wat",
      description: "The largest religious monument in the world, this 12th-century temple complex in Cambodia is a masterpiece of Khmer architecture.",
      bestTime: "Sunrise for the iconic reflection photo. November to February for dry, cooler weather.",
      category: "culture",
    },
    geometry: { type: "Point", coordinates: [103.87, 13.41] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-grandcanyon",
      name: "Grand Canyon",
      description: "A steep-sided canyon carved by the Colorado River, exposing nearly 2 billion years of Earth's geological history.",
      bestTime: "March to May or September to November. Sunrise and sunset for the most dramatic colors.",
      category: "nature",
    },
    geometry: { type: "Point", coordinates: [-112.11, 36.11] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-fushimi",
      name: "Fushimi Inari Shrine",
      description: "Iconic Shinto shrine in Kyoto famous for its thousands of vermillion torii gates winding up the mountainside.",
      bestTime: "Early morning (before 7am) to walk the gates in peaceful solitude. Beautiful year-round.",
      category: "culture",
    },
    geometry: { type: "Point", coordinates: [135.77, 34.97] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-serengeti",
      name: "Serengeti National Park",
      description: "Vast African savanna hosting the Great Migration — over 1.5 million wildebeest and zebra in a dramatic annual journey.",
      bestTime: "July-October for river crossings. June-September for overall best game viewing.",
      category: "nature",
    },
    geometry: { type: "Point", coordinates: [34.83, -2.33] },
  },
  {
    type: "Feature",
    properties: {
      id: "poi-pelourinho",
      name: "Pelourinho, Salvador",
      description: "UNESCO World Heritage historic center of Salvador, Brazil. Colorful colonial architecture, Afro-Brazilian culture, and vibrant music.",
      bestTime: "Tuesday evenings for live Olodum drumming. September-February for festival season.",
      category: "culture",
    },
    geometry: { type: "Point", coordinates: [-38.51, -12.97] },
  },
];

export const regionsGeoJSON: FeatureCollection<Polygon, RegionProperties> = {
  type: "FeatureCollection",
  features: regionFeatures,
};

export const poisGeoJSON: FeatureCollection<Point, POIProperties> = {
  type: "FeatureCollection",
  features: poiFeatures,
};

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
      if (score >= 7.5) return "hsla(38, 92%, 55%, 0.75)";
      if (score >= 5.5) return "hsla(38, 60%, 45%, 0.6)";
      return "hsla(222, 20%, 35%, 0.5)";
    }
  }
}

export const POI_ICONS: Record<string, string> = {
  landmark: "🏛️",
  nature: "🌿",
  culture: "⛩️",
  beach: "🏖️",
};
