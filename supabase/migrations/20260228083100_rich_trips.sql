-- Migration: Add rich content fields to user_trips

-- 1. Add description, notes, and image_url to user_trips
ALTER TABLE public.user_trips
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS companions TEXT,
ADD COLUMN IF NOT EXISTS trip_type TEXT;
