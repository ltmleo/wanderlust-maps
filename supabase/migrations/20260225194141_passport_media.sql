-- Add columns to poi_reviews for social media
ALTER TABLE public.poi_reviews ADD COLUMN IF NOT EXISTS social_video_url TEXT;
ALTER TABLE public.poi_reviews ADD COLUMN IF NOT EXISTS social_image_url TEXT;
ALTER TABLE public.poi_reviews ALTER COLUMN content DROP NOT NULL;
