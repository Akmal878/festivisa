-- =====================================================
-- SETUP ORGANIZER ACCOUNT - EASY 3-STEP PROCESS
-- =====================================================

-- ============== STEP 1: RUN THIS FIRST ==============
-- This will show you all registered users
SELECT id, email, created_at FROM auth.users;

-- Copy the ID (UUID) from the results above for your account
-- It will look like: a1b2c3d4-e5f6-7890-abcd-ef1234567890


-- ============== STEP 2: REPLACE UUID BELOW ==============
-- Replace 'PASTE-YOUR-UUID-HERE' with the actual UUID from Step 1
-- Then run this block

-- Set the user ID variable (EDIT THIS LINE!)
DO $$ 
DECLARE
  target_user_id UUID := 'PASTE-YOUR-UUID-HERE';  -- ← CHANGE THIS!
BEGIN
  -- Add organizer role
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, 'organizer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create or update profile
  INSERT INTO public.profiles (id, full_name, email, phone, address)
  SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Organizer'), 
    email,
    raw_user_meta_data->>'phone',
    raw_user_meta_data->>'address'
  FROM auth.users
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = EXCLUDED.email,
    updated_at = NOW();
    
  RAISE NOTICE 'Organizer account setup complete!';
END $$;


-- ============== STEP 3: VERIFY SETUP ==============
-- Run this to confirm everything is set up correctly
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  p.phone,
  p.address,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'organizer';

-- If you see your account with role='organizer', you're done!
-- Refresh your app and you should be able to add venues.
