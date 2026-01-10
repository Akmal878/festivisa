-- Remove wedding-specific service columns and keep general ones
ALTER TABLE public.events DROP COLUMN IF EXISTS hotel_decoration;
ALTER TABLE public.events DROP COLUMN IF EXISTS fireworks;

-- Keep catering and photography as they are general services applicable to all events
