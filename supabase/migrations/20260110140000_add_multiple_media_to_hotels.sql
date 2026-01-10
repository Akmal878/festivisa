-- Add support for multiple images and videos
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS video_urls TEXT[];

-- Update existing hotels to have empty arrays if null
UPDATE public.hotels SET image_urls = ARRAY[]::TEXT[] WHERE image_urls IS NULL;
UPDATE public.hotels SET video_urls = ARRAY[]::TEXT[] WHERE video_urls IS NULL;
