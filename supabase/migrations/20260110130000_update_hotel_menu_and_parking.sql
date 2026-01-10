-- Update parking details to parking_capacity (number of cars)
ALTER TABLE public.hotels ADD COLUMN parking_capacity INTEGER;

-- Remove old text-based menu_details
ALTER TABLE public.hotels DROP COLUMN IF EXISTS menu_details;

-- Create menu_bundles table for structured menu offerings
CREATE TABLE public.menu_bundles (
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

-- Enable RLS
ALTER TABLE public.menu_bundles ENABLE ROW LEVEL SECURITY;

-- Policies for menu_bundles
CREATE POLICY "Anyone can view menu bundles" ON public.menu_bundles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage own menu bundles" ON public.menu_bundles FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can update own menu bundles" ON public.menu_bundles FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can delete own menu bundles" ON public.menu_bundles FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_menu_bundles_updated_at BEFORE UPDATE ON public.menu_bundles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
