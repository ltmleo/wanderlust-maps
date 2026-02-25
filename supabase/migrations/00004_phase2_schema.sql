-- Add social video url to pois
ALTER TABLE public.pois ADD COLUMN IF NOT EXISTS social_video_url TEXT;

-- Create user_trips table
CREATE TABLE IF NOT EXISTS public.user_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    region_id TEXT REFERENCES public.regions(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for user_trips
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view their own trips" ON public.user_trips FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own trips" ON public.user_trips FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own trips" ON public.user_trips FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own trips" ON public.user_trips FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create poi_reviews table
CREATE TABLE IF NOT EXISTS public.poi_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    poi_id TEXT REFERENCES public.pois(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for poi_reviews
ALTER TABLE public.poi_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
DO $$ BEGIN
    CREATE POLICY "Anyone can view reviews" ON public.poi_reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated users can create reviews
DO $$ BEGIN
    CREATE POLICY "Authenticated users can insert reviews" ON public.poi_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can update their own reviews
DO $$ BEGIN
    CREATE POLICY "Users can update their own reviews" ON public.poi_reviews FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can delete their own reviews
DO $$ BEGIN
    CREATE POLICY "Users can delete their own reviews" ON public.poi_reviews FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
