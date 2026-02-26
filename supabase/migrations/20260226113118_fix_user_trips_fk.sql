DO $$ 
BEGIN 
    -- If 'destination' column exists, but 'region_id' doesn't, rename it.
    -- If both exist, we can drop 'destination' because it's obsolete.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_trips' AND column_name = 'destination') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_trips' AND column_name = 'region_id') THEN
            ALTER TABLE public.user_trips RENAME COLUMN destination TO region_id;
        ELSE
            ALTER TABLE public.user_trips DROP COLUMN destination CASCADE;
        END IF;
    END IF;

    -- Add region_id column if it still doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_trips' AND column_name = 'region_id') THEN
        ALTER TABLE public.user_trips ADD COLUMN region_id TEXT;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist or is somehow missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public'
        AND constraint_name = 'user_trips_region_id_fkey'
        AND table_name = 'user_trips'
    ) THEN
        ALTER TABLE public.user_trips
        ADD CONSTRAINT user_trips_region_id_fkey
        FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
