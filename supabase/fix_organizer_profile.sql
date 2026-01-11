-- =====================================================
-- FIX ORGANIZER PROFILE
-- Run this to check and create missing profile data
-- =====================================================

-- STEP 1: Check your user ID and if profile exists
SELECT 
  u.id as user_id, 
  u.email,
  p.full_name,
  p.phone,
  p.address,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id;

-- STEP 2: If profile is missing, create it manually
-- Replace 'YOUR-USER-ID' with your actual UUID from above query
-- Replace 'Your Name' with your actual name
-- Replace 'your@email.com' with your actual email

INSERT INTO public.profiles (id, full_name, email, phone, address)
VALUES (
  'YOUR-USER-ID', 
  'Your Name',
  'your@email.com',
  '+923001234567',  -- Optional: your phone
  'Lahore'  -- Optional: your city
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

-- STEP 3: Ensure organizer role exists
-- Replace 'YOUR-USER-ID' with your actual UUID
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR-USER-ID', 'organizer')
ON CONFLICT (user_id, role) DO NOTHING;

-- STEP 4: Verify everything is set up correctly
SELECT 
  u.id as user_id, 
  u.email,
  p.full_name,
  p.phone,
  p.address,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'organizer';
