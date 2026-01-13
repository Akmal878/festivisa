# Vercel Deployment Guide for Festivisa

## ✅ Completed Steps

Your code has been successfully pushed to GitHub. Now follow these steps to deploy to Vercel:

## 🚀 Vercel Deployment Steps

### 1. Connect to Vercel (if not already connected)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New Project"**
4. Import your `festivisa` repository from GitHub
5. Vercel will auto-detect it as a Vite project ✅

### 2. Configure Environment Variables

Before deploying, add these environment variables in Vercel:

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

```
VITE_SUPABASE_URL = https://xlficcqvvdgdtncadnqc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = <your-supabase-anon-key>
```

**Important:** Get your Supabase anon key from:
- Supabase Dashboard → Your Project → Settings → API
- Copy the `anon` / `public` key (NOT the service_role key)

### 3. Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Build your Vite React app
   - Deploy the Python recommendation API as a serverless function
   - Set up automatic deployments for future pushes to `main` branch

### 4. Verify Deployment

Once deployed, test these endpoints:

- **Frontend**: `https://your-project.vercel.app`
- **Recommendation API**: `https://your-project.vercel.app/api/recommendations`

## 🔧 How It Works

### Serverless Python API
- The recommendation engine is in `/api/recommendations.py`
- Vercel automatically converts it to a serverless function
- No need for Flask server or localhost:5000
- API is accessible at `/api/recommendations` (relative path)

### Automatic Configuration
- Frontend uses relative path `/api/recommendations` (no hardcoded URLs)
- Environment variables are injected at build time
- Both frontend and backend use the same Supabase credentials

### CI/CD Pipeline
- Every push to `main` branch triggers automatic deployment
- Vercel handles builds, previews, and production deployments
- No manual configuration needed after initial setup

## 🎯 Features Deployed

- ✅ AI-powered venue recommendations
- ✅ Location-based matching (40% weight)
- ✅ Capacity fitting (30% weight)
- ✅ Budget optimization (20% weight)
- ✅ Event type matching (10% weight)
- ✅ Secure token-based authentication
- ✅ Real-time data from Supabase

## 🐛 Troubleshooting

### Python API Not Working
- Check environment variables in Vercel dashboard
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
- View deployment logs in Vercel dashboard

### Empty Recommendations
- Verify you have events created in the app
- Check that hotels and halls exist in database
- Review Supabase RLS policies for `events`, `hotels`, and `hotel_halls` tables

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` and `api/requirements.txt`
- Verify Python version compatibility (Vercel uses Python 3.9+)

## 📝 Next Steps

1. **Monitor Performance**: Use Vercel Analytics to track API response times
2. **Set Up Alerts**: Configure Vercel notifications for deployment failures
3. **Custom Domain**: Add your custom domain in Vercel project settings
4. **Environment Staging**: Create separate Supabase projects for dev/staging/prod

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Supabase Documentation](https://supabase.com/docs)

---

**Everything is configured for auto-deployment!** 🎉

Just push to GitHub, and Vercel handles the rest. No localhost dependencies, no manual configuration needed.
