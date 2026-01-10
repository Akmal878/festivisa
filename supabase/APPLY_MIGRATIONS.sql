-- =====================================================
-- APPLY ALL MIGRATIONS FOR FESTIVISA
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- 1. Add map_location column
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS map_location TEXT;

-- 2. Add parking_capacity column
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS parking_capacity INTEGER;

-- 3. Add image_urls and video_urls for multiple media support
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS video_urls TEXT[];

-- Initialize arrays as empty for existing records
UPDATE public.hotels SET image_urls = ARRAY[]::TEXT[] WHERE image_urls IS NULL;
UPDATE public.hotels SET video_urls = ARRAY[]::TEXT[] WHERE video_urls IS NULL;

-- 4. Create menu_bundles table for structured menu offerings
CREATE TABLE IF NOT EXISTS public.menu_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  chicken_dish TEXT NOT NULL,
  rice_dish TEXT NOT NULL,
  additional_main_dishes TEXT[],
  include_drinks BOOLEAN DEFAULT false,
  include_raita BOOLEAN DEFAULT false,
  include_salad BOOLEAN DEFAULT false,
  include_cream_salad BOOLEAN DEFAULT false,
  include_sweet_dish BOOLEAN DEFAULT false,
  sweet_dish_type TEXT,
  include_tea BOOLEAN DEFAULT false,
  include_table_service BOOLEAN DEFAULT false,
  custom_optional_items TEXT[],
  final_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on menu_bundles
ALTER TABLE public.menu_bundles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can view menu bundles" ON public.menu_bundles;
DROP POLICY IF EXISTS "Organizers can manage own menu bundles" ON public.menu_bundles;
DROP POLICY IF EXISTS "Organizers can update own menu bundles" ON public.menu_bundles;
DROP POLICY IF EXISTS "Organizers can delete own menu bundles" ON public.menu_bundles;

-- Policies for menu_bundles
CREATE POLICY "Anyone can view menu bundles" ON public.menu_bundles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage own menu bundles" ON public.menu_bundles FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can update own menu bundles" ON public.menu_bundles FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can delete own menu bundles" ON public.menu_bundles FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));

-- Create or replace trigger function for updated_at (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on menu_bundles
DROP TRIGGER IF EXISTS update_menu_bundles_updated_at ON public.menu_bundles;
CREATE TRIGGER update_menu_bundles_updated_at 
  BEFORE UPDATE ON public.menu_bundles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- MIGRATION COMPLETE
-- Your database is now ready for:
-- - Multiple images (image_urls array)
-- - Multiple videos (video_urls array)  
-- - Menu bundles (menu_bundles table)
-- - Map location (map_location field)
-- - Parking capacity (parking_capacity field)
-- =====================================================
