-- Migration 00002: Geographic Data Schema (Regions & POIs)

-- 1. Create Regions Table
CREATE TABLE IF NOT EXISTS public.regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  description_pt TEXT,
  geometry_geojson JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In a production environment with millions of users, you might want to cache this,
-- but for now, anyone can read Regions.
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public regions are viewable by everyone." ON public.regions FOR SELECT USING (true);


-- 2. Create Region Monthly Data Table (Normalized for fast 12-month queries)
CREATE TABLE IF NOT EXISTS public.region_monthly_data (
  region_id TEXT REFERENCES public.regions(id) ON DELETE CASCADE,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  weather_score FLOAT NOT NULL,
  cost_score FLOAT NOT NULL,
  recommended_score FLOAT NOT NULL,
  weather_desc TEXT NOT NULL,
  weather_desc_pt TEXT,
  avg_daily_cost FLOAT NOT NULL,
  highlights JSONB NOT NULL,
  highlights_pt JSONB,
  why_visit TEXT NOT NULL,
  why_visit_pt TEXT,
  PRIMARY KEY (region_id, month)
);

ALTER TABLE public.region_monthly_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public monthly data is viewable by everyone." ON public.region_monthly_data FOR SELECT USING (true);


-- 3. Create Points of Interest (POIs) Table
-- We extract Lat/Lng for Bounding Box (BBOX) queries in the frontend.
CREATE TABLE IF NOT EXISTS public.pois (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT,
  description TEXT NOT NULL,
  description_pt TEXT,
  best_time TEXT NOT NULL,
  best_time_pt TEXT,
  category TEXT NOT NULL, -- e.g., 'landmark', 'nature'
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  image_url TEXT,
  image_gallery JSONB,
  caraiqbonito BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public POIs are viewable by everyone." ON public.pois FOR SELECT USING (true);

-- Create simple indexes for spatial bounding box queries on POIs
CREATE INDEX IF NOT EXISTS idx_pois_lat_lng ON public.pois(lat, lng);
CREATE INDEX IF NOT EXISTS idx_pois_category ON public.pois(category);
