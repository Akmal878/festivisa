# Database Migration Required

## Issue
The following features are not working because the database columns don't exist yet:
- ❌ Multiple images (only 1 image showing)
- ❌ Videos section
- ❌ Menu bundles display

## Solution
Apply the database migration to add the missing columns and tables.

## Steps to Apply Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/APPLY_MIGRATIONS.sql`
5. Copy ALL the contents
6. Paste into the SQL Editor
7. Click **Run** button
8. You should see success messages

### Option 2: Via Supabase CLI
If you have Supabase CLI installed:
```bash
supabase db push
```

## What This Migration Does

### 1. Adds New Columns to hotels table:
- `image_urls` (TEXT[]) - Store multiple images (up to 20)
- `video_urls` (TEXT[]) - Store multiple videos (up to 3)
- `map_location` (TEXT) - Google Maps location
- `parking_capacity` (INTEGER) - Number of parking spaces

### 2. Creates menu_bundles table:
- Stores menu packages with main dishes
- Optional items (raita, salad, drinks, tea, etc.)
- Custom additional items
- Pricing per bundle
- Full RLS policies for security

### 3. Adds Security Policies:
- Anyone can view menu bundles
- Only organizers can manage their own menu bundles

## After Migration

Once you've applied the migration:
1. ✅ Create a new venue - upload up to 20 images and 3 videos
2. ✅ Add menu bundles with customizable dishes and optional items
3. ✅ Users will see image carousel with navigation
4. ✅ Separate video section with video player
5. ✅ Menu packages displayed in beautiful cards

## Current Code Status

The application code is already updated and ready to use these features:
- ✅ AddHotel.tsx - Saves multiple images and videos
- ✅ HotelDetailModal.tsx - Displays carousel, videos, and menu cards
- ✅ TypeScript types updated

**The code will work immediately after applying the migration!**

## Testing After Migration

1. Log in as an organizer
2. Go to "Add Hotel"
3. Upload multiple images (up to 20)
4. Upload videos (up to 3, each max 30 seconds)
5. Add menu bundles with dishes and prices
6. Submit the form
7. View the hotel details - you should see all images in a carousel, videos in a grid, and menu cards

## Need Help?

If you encounter any errors:
1. Check the Supabase SQL Editor for error messages
2. Make sure you're connected to the correct project
3. Verify you have admin access to run SQL commands
4. The migration uses `IF NOT EXISTS` so it's safe to run multiple times
