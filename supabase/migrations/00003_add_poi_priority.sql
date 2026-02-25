-- Migration 00003: Add priority column to pois

-- 1. Add priority column with default 5 (medium priority)
ALTER TABLE public.pois ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5 NOT NULL;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_pois_priority ON public.pois(priority);

-- Note:
-- Priority 0: Global Highlights (e.g. Eiffel Tower, Christ the Redeemer)
-- Priority 1: High Relevance
-- Priority 5: Medium Relevance (Default)
-- Priority 10: Local/Minor Points of Interest
