# Festivisa AI Recommendation Service

A Python-based recommendation engine for venue suggestions.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
Create a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
```

5. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5000`

## API Endpoints

### GET /api/recommendations
Get AI-based venue recommendations for a user's events.

**Headers:**
- `Authorization: Bearer <user_token>`

**Response:**
```json
{
  "recommendations": [
    {
      "hotel": {...},
      "hall": {...},
      "event": {...},
      "matchScore": 85,
      "reasons": ["Perfect location match", "Hall capacity fits 200 guests"],
      "confidence": 0.85
    }
  ]
}
```

## Algorithm

The recommendation system uses a weighted scoring algorithm considering:
- Location matching (40%)
- Capacity matching (30%)
- Budget compatibility (20%)
- Event type matching (10%)

Match scores are normalized to 0-100 scale.
