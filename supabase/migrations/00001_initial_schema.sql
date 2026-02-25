-- Migration 00001: Initial Schema & Security Policies
-- This schema focuses on security and scalability for future features.

-- 1. Create a public profiles table that links to auth.users (Supabase's built-in auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- 1. Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);


-- 2. Create a generic "trips" or "saved_locations" table for future features
CREATE TABLE IF NOT EXISTS public.user_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_trips
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;

-- User Trips Policies
-- 1. Users can ONLY see their own trips (Strict isolation)
CREATE POLICY "Users can view their own trips." 
  ON public.user_trips FOR SELECT 
  USING (auth.uid() = user_id);

-- 2. Users can create their own trips
CREATE POLICY "Users can insert their own trips." 
  ON public.user_trips FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own trips
CREATE POLICY "Users can update their own trips." 
  ON public.user_trips FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. Users can delete their own trips
CREATE POLICY "Users can delete their own trips." 
  ON public.user_trips FOR DELETE 
  USING (auth.uid() = user_id);


-- Function to automatically create a profile row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after an insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
