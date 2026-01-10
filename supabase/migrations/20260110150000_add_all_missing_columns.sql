-- Add all missing columns to hotels table

-- Add map_location if it doesn't exist
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS map_location TEXT;

-- Add parking_capacity if it doesn't exist (replaces parking_details as number)
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS parking_capacity INTEGER;

-- Add image_urls and video_urls for multiple media support
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS video_urls TEXT[];

-- Initialize arrays as empty for existing records
UPDATE public.hotels SET image_urls = ARRAY[]::TEXT[] WHERE image_urls IS NULL;
UPDATE public.hotels SET video_urls = ARRAY[]::TEXT[] WHERE video_urls IS NULL;

-- You can optionally drop old menu_details column if menu_bundles table is being used instead
-- ALTER TABLE public.hotels DROP COLUMN IF EXISTS menu_details;
