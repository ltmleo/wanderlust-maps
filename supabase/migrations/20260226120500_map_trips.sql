-- Migration: Add POI support to user_trips and update RLS to allow viewing community trips

-- 1. Add poi_id to user_trips and make region_id optional
ALTER TABLE public.user_trips
ADD COLUMN IF NOT EXISTS poi_id TEXT REFERENCES public.pois(id) ON DELETE CASCADE;

ALTER TABLE public.user_trips
ALTER COLUMN region_id DROP NOT NULL;

-- 2. Ensure at least one of region_id or poi_id is provided
ALTER TABLE public.user_trips
ADD CONSTRAINT user_trips_location_check 
CHECK (region_id IS NOT NULL OR poi_id IS NOT NULL);

-- 3. Update RLS on user_trips to allow anyone to view trips (community trips feature)

-- Drop the old select policy
DROP POLICY IF EXISTS "Users can view their own trips" ON public.user_trips;

-- Create the new select policy
DO $$ BEGIN
    CREATE POLICY "Anyone can view trips" ON public.user_trips FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop and recreate the "Users can view their own trips." if it was named differently in initial schema
DROP POLICY IF EXISTS "Users can view their own trips." ON public.user_trips;

-- Note: The insert, update, and delete policies remain unchanged.
