# FESTIVISA - COMPLETE SETUP GUIDE

## ✅ CURRENT STATUS
Your application code is properly set up with:
- ✅ User and Organizer authentication
- ✅ Venue registration form (AddHotel.tsx)
- ✅ Event registration form (AddEvent.tsx)  
- ✅ Profile editing (Profile.tsx)
- ✅ Organizer dashboard
- ✅ Database schema with all tables

## 🔧 TO MAKE IT FULLY FUNCTIONAL

### STEP 1: Setup Your Organizer Account in Supabase

**Open:** `supabase/setup_organizer_account.sql`

**Run these 3 steps in Supabase SQL Editor:**

1. **Get your user ID** - Run this first:
```sql
SELECT id, email, created_at FROM auth.users;
```
Copy the UUID from the results (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

2. **Edit and run** - Replace `'PASTE-YOUR-UUID-HERE'` with your actual UUID:
```sql
DO $$ 
DECLARE
  target_user_id UUID := 'YOUR-ACTUAL-UUID-HERE';  -- ← PUT YOUR UUID HERE!
BEGIN
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, 'organizer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.profiles (id, full_name, email)
  SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Organizer'), email
  FROM auth.users
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = EXCLUDED.email,
    updated_at = NOW();
END $$;
```

3. **Verify** - Run this to confirm:
```sql
SELECT u.id, u.email, p.full_name, ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'organizer';
```

### STEP 2: Test the Application

After Step 1, **refresh your browser** and test:

#### As Organizer:
1. Login to your account
2. You should see: Dashboard, Add Venue, Browse Events, Favorites, Sent Invites, Messages
3. Go to **Add Venue** - Fill out the form with:
   - Venue Name
   - Description
   - Address
   - City
   - Images (up to 20)
   - Videos (up to 3)
   - Halls information
   - Menu bundles
   - Parking capacity
   - Google Maps location
4. Click Submit - venue should be created
5. Go to **Profile** - edit your information

#### As User (Regular):
1. Sign up a new account (choose "User" role during signup)
2. You should see: Add Event, My Events, Invites, Messages
3. Go to **Add Event** - Create an event
4. Wait for organizers to send you invites for their venues
5. Check **My Invites** to see venue proposals

### STEP 3: Create Additional Test Accounts

**Create a test user account:**
1. Sign out from organizer account
2. Click "Sign Up"
3. Fill form and select **"User"** role
4. Submit - profile and role will be auto-created

**Create another organizer account:**
1. Sign out
2. Click "Sign Up"  
3. Fill form and select **"Organizer"** role
4. Submit - profile and role will be auto-created

## 📋 HOW THE APP WORKS

### For Users (Event Hosts):
1. **Sign Up** as "User"
2. **Create Event** - Post what kind of event you're planning
3. **Receive Invites** - Organizers will send you proposals with their venues
4. **Review Venues** - See venue details, images, videos, halls, menu, parking
5. **Accept/Reject** - Choose the venue you like
6. **Chat** - Communicate with organizers

### For Organizers (Venue Providers):
1. **Sign Up** as "Organizer"
2. **Add Venue** - Upload your venue details, images, videos, facilities
3. **Browse Events** - See all open events posted by users
4. **Send Invites** - Propose your venue to events you can handle
5. **Track Invites** - See sent invites status
6. **Favorites** - Save events you're interested in
7. **Chat** - Communicate with event hosts

## 🔍 TROUBLESHOOTING

### "Only organizers can add venues" error:
- Your organizer role is not set up
- Follow Step 1 above

### "Failed to create hotel" error:
1. Open browser console (F12)
2. Look for the error details
3. Check if it says "permission denied" - means role is not set
4. Check if it says "violates check constraint" - means required field is missing

### Profile not loading:
- Your profile doesn't exist in database
- Run Step 1 above, it will create it

### Can't see navigation menu items:
- Role not assigned properly
- Clear browser cache and refresh
- Re-run Step 1

### New signups not working:
- Check if `on_auth_user_created` trigger exists in Supabase
- Run `COMPLETE_SETUP.sql` again if needed

## 📝 FEATURES CHECKLIST

✅ User Registration with Role Selection
✅ Organizer Registration with Role Selection  
✅ Add Event (Users only)
✅ Add Venue/Hotel (Organizers only)
✅ Upload Multiple Images (up to 20)
✅ Upload Multiple Videos (up to 3)
✅ Venue Halls Management
✅ Menu Bundles Creation
✅ Parking Information
✅ Google Maps Location
✅ Profile Editing (All users)
✅ Browse Events (Organizers)
✅ Send Invites (Organizers to Users)
✅ View Invites (Users)
✅ Favorites System (Organizers)
✅ Chat System (Between Users and Organizers)
✅ Organizer Dashboard with Stats
✅ Responsive Mobile Design
✅ Purple/Violet Theme

## 🚀 NEXT STEPS AFTER SETUP

1. **Add More Venues** - Create multiple venue listings
2. **Create Test Events** - Post some sample events
3. **Test Invite Flow** - Send invites and accept/reject them
4. **Test Chat** - Try messaging between user and organizer
5. **Test on Mobile** - Check responsive design

## 📞 SUPPORT

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check Supabase logs for database errors
3. Verify all SQL setup steps were completed
4. Ensure you're using the correct role for each action

---

**Remember:** After running SQL setup, always **refresh your browser** to apply changes!
