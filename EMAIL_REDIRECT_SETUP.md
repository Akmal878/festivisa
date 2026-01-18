# Email Redirect Configuration Guide

## Problem
Email confirmation links redirect to `localhost` instead of your production URL.

## Solution

### 1. Add Environment Variable to Vercel

Go to your Vercel dashboard:
1. Open your project: https://vercel.com/dashboard
2. Go to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_SITE_URL`
   - **Value**: `https://festivisa.vercel.app` (or your actual Vercel URL)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### 2. Configure Supabase Redirect URLs

Go to your Supabase dashboard:
1. Open project: https://supabase.com/dashboard/project/xlficcqvvdgdtncadnqc
2. Go to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://festivisa.vercel.app
   https://festivisa.vercel.app/
   https://festivisa.vercel.app/**
   http://localhost:5173
   http://localhost:5173/
   ```
4. Set **Site URL** to: `https://festivisa.vercel.app`
5. Click **Save**

### 3. Redeploy on Vercel

After adding the environment variable:
1. Go to **Deployments** tab in Vercel
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### 4. Test Email Confirmation

1. Sign up with a new email
2. Check your email inbox
3. Click the confirmation link
4. Should now redirect to `https://festivisa.vercel.app` instead of localhost

## How It Works

The code now uses:
```typescript
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
const redirectUrl = `${siteUrl}/`;
```

- **Production**: Uses `VITE_SITE_URL` from Vercel environment variables
- **Local Development**: Falls back to `window.location.origin` (localhost)

## Troubleshooting

If redirects still go to localhost:
1. Verify `VITE_SITE_URL` is set in Vercel environment variables
2. Ensure you redeployed after adding the variable
3. Check Supabase redirect URLs include your production URL
4. Try signing up with a different email address (old tokens may be cached)
