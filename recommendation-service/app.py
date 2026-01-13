from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from datetime import datetime
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def supabase_query(table: str, select: str = '*', filters: dict = None):
    """Make a direct REST API call to Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {'select': select}
    if filters:
        params.update(filters)
    
    print(f'Querying: {url} with params: {params}')
    response = requests.get(url, headers=headers, params=params)
    print(f'Query response status: {response.status_code}')
    print(f'Query response: {response.text[:500]}')
    response.raise_for_status()
    return response.json()

class VenueRecommendationEngine:
    def __init__(self):
        self.location_weight = 0.40
        self.capacity_weight = 0.30
        self.budget_weight = 0.20
        self.event_type_weight = 0.10
        
    def normalize_location(self, location):
        """Normalize location string for better matching"""
        return location.lower().strip()
    
    def calculate_location_score(self, event_location, hotel_city):
        """Calculate location match score using string similarity"""
        event_loc = self.normalize_location(event_location)
        hotel_loc = self.normalize_location(hotel_city)
        
        # Exact match
        if event_loc == hotel_loc:
            return 100
        
        # Partial match
        if event_loc in hotel_loc or hotel_loc in event_loc:
            return 50
        
        # Check for common cities/regions
        common_words = set(event_loc.split()) & set(hotel_loc.split())
        if common_words:
            return 30
        
        return 0
    
    def calculate_capacity_score(self, event_guests, hall_capacity):
        """Calculate how well the hall capacity matches guest count"""
        if hall_capacity is None:
            return 25  # Some score for halls without specified capacity
        
        # Perfect fit (capacity is 100-120% of guest count)
        ratio = hall_capacity / event_guests
        
        if 1.0 <= ratio <= 1.2:
            return 100
        elif 0.8 <= ratio < 1.0:
            # Slightly small
            return 70
        elif 1.2 < ratio <= 1.5:
            # Slightly large but acceptable
            return 85
        elif ratio > 1.5:
            # Too large
            return max(50 - (ratio - 1.5) * 10, 20)
        else:
            # Too small
            return max(30 - (1.0 - ratio) * 50, 0)
    
    def calculate_budget_score(self, event_budget, hall_price):
        """Calculate budget compatibility score"""
        if event_budget is None or hall_price is None:
            return 50  # Neutral score if budget info missing
        
        price_ratio = hall_price / event_budget
        
        if price_ratio <= 0.7:
            # Excellent value
            return 100
        elif price_ratio <= 0.85:
            # Good value
            return 90
        elif price_ratio <= 1.0:
            # Within budget
            return 80
        elif price_ratio <= 1.15:
            # Slightly over budget
            return 50
        elif price_ratio <= 1.3:
            # Moderately over budget
            return 30
        else:
            # Way over budget
            return 10
    
    def calculate_event_type_score(self, event_type, event_name, hotel_description):
        """Calculate event type matching using keyword analysis"""
        if not hotel_description:
            return 50  # Neutral score if no description
        
        try:
            # Combine event info
            event_text = f"{event_type} {event_name}".lower()
            hotel_text = hotel_description.lower()
            
            # Extract keywords
            event_keywords = set(re.findall(r'\w+', event_text))
            hotel_keywords = set(re.findall(r'\w+', hotel_text))
            
            # Remove common stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            event_keywords -= stop_words
            hotel_keywords -= stop_words
            
            # Find matches
            common_keywords = event_keywords & hotel_keywords
            
            if len(common_keywords) > 0:
                # Calculate match ratio
                match_ratio = len(common_keywords) / len(event_keywords) if event_keywords else 0
                return min(100, 60 + match_ratio * 40)
            
            # Check for semantic similarity using simple word containment
            similarity_count = sum(1 for word in event_keywords if word in hotel_text)
            if similarity_count > 0:
                return min(100, 50 + (similarity_count / len(event_keywords)) * 30)
            
            return 40
        except:
            return 50
    
    def calculate_overall_score(self, scores):
        """Calculate weighted overall match score"""
        overall = (
            scores['location'] * self.location_weight +
            scores['capacity'] * self.capacity_weight +
            scores['budget'] * self.budget_weight +
            scores['event_type'] * self.event_type_weight
        )
        return round(overall, 2)
    
    def generate_reasons(self, scores, event, hotel, hall):
        """Generate human-readable reasons for the match"""
        reasons = []
        
        # Location
        if scores['location'] >= 90:
            reasons.append("Perfect location match")
        elif scores['location'] >= 50:
            reasons.append("Nearby location")
        elif scores['location'] >= 30:
            reasons.append("In the same region")
        
        # Capacity
        if hall and hall.get('capacity'):
            if scores['capacity'] >= 90:
                reasons.append(f"Ideal hall capacity for {event['guest_count']} guests")
            elif scores['capacity'] >= 70:
                reasons.append(f"Hall can accommodate {event['guest_count']} guests")
            elif scores['capacity'] >= 50:
                reasons.append(f"Hall available (capacity: {hall['capacity']})")
        
        # Budget
        if scores['budget'] >= 90:
            reasons.append("Excellent value - Great savings!")
        elif scores['budget'] >= 80:
            reasons.append("Within your budget")
        elif scores['budget'] >= 50:
            reasons.append("Slightly above budget")
        
        # Event Type
        if scores['event_type'] >= 70:
            reasons.append(f"Perfect for {event['event_type']} events")
        elif scores['event_type'] >= 60:
            reasons.append(f"Suitable for {event['event_type']}")
        
        return reasons
    
    def recommend_venues(self, events, hotels, halls):
        """Generate recommendations for all events"""
        recommendations = []
        
        for event in events:
            for hotel in hotels:
                # Find halls for this hotel
                hotel_halls = [h for h in halls if h['hotel_id'] == hotel['id']]
                
                if not hotel_halls:
                    # No halls, use hotel-level scoring
                    scores = {
                        'location': self.calculate_location_score(event['location'], hotel['city']),
                        'capacity': 50,  # Neutral
                        'budget': 50,    # Neutral
                        'event_type': self.calculate_event_type_score(
                            event['event_type'], 
                            event['event_name'], 
                            hotel.get('description', '')
                        )
                    }
                    
                    overall_score = self.calculate_overall_score(scores)
                    
                    if overall_score >= 40:  # Minimum threshold
                        recommendations.append({
                            'hotel': hotel,
                            'hall': None,
                            'event': event,
                            'matchScore': overall_score,
                            'reasons': self.generate_reasons(scores, event, hotel, None),
                            'confidence': overall_score / 100,
                            'scores': scores
                        })
                else:
                    # Score each hall
                    for hall in hotel_halls:
                        scores = {
                            'location': self.calculate_location_score(event['location'], hotel['city']),
                            'capacity': self.calculate_capacity_score(event['guest_count'], hall.get('capacity')),
                            'budget': self.calculate_budget_score(event.get('budget'), hall.get('price_per_event')),
                            'event_type': self.calculate_event_type_score(
                                event['event_type'], 
                                event['event_name'], 
                                hotel.get('description', '')
                            )
                        }
                        
                        overall_score = self.calculate_overall_score(scores)
                        
                        if overall_score >= 40:  # Minimum threshold
                            recommendations.append({
                                'hotel': hotel,
                                'hall': hall,
                                'event': event,
                                'matchScore': overall_score,
                                'reasons': self.generate_reasons(scores, event, hotel, hall),
                                'confidence': overall_score / 100,
                                'scores': scores
                            })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return recommendations

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        # Get user ID from authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print('No auth header found')
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split(' ')[1]
        print(f'Token received: {token[:20]}...')
        
        # Verify token with Supabase - use the anon key in apikey header
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {token}'
        }
        
        print(f'Calling: {SUPABASE_URL}/auth/v1/user')
        user_response = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
        print(f'User response status: {user_response.status_code}')
        print(f'User response: {user_response.text[:200]}')
        
        if user_response.status_code != 200:
            return jsonify({'error': 'Invalid token', 'details': user_response.text}), 401
        
        user_data = user_response.json()
        user_id = user_data.get('id')
        print(f'User ID: {user_id}')
        
        # Fetch user's events (all statuses, not just open)
        events = supabase_query('events', '*', {'user_id': f'eq.{user_id}'})
        print(f'Found {len(events) if events else 0} events')
        print(f'Events: {events}')
        
        if not events:
            return jsonify({'recommendations': [], 'message': 'No events found'})
        
        # Fetch all hotels
        hotels = supabase_query('hotels', '*')
        print(f'Found {len(hotels) if hotels else 0} hotels')
        
        # Fetch all halls
        halls = supabase_query('hotel_halls', '*')
        print(f'Found {len(halls) if halls else 0} halls')
        
        # Generate recommendations
        engine = VenueRecommendationEngine()
        recommendations = engine.recommend_venues(events, hotels, halls)
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'recommendation-engine'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
