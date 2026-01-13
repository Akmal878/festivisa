from http.server import BaseHTTPRequestHandler
import json
import requests
import os
import re
from urllib.parse import parse_qs

# Supabase configuration
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

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
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

class VenueRecommendationEngine:
    def __init__(self):
        self.location_weight = 0.4
        self.capacity_weight = 0.3
        self.budget_weight = 0.2
        self.event_type_weight = 0.1
    
    def calculate_location_score(self, event_location, hotel_location):
        """Calculate location match score"""
        event_loc = str(event_location).lower().strip()
        hotel_loc = str(hotel_location).lower().strip()
        
        if event_loc == hotel_loc:
            return 100
        
        if event_loc in hotel_loc or hotel_loc in event_loc:
            return 50
        
        common_words = set(event_loc.split()) & set(hotel_loc.split())
        if common_words:
            return 30
        
        return 0
    
    def calculate_capacity_score(self, event_guests, hall_capacity):
        """Calculate how well the hall capacity matches guest count"""
        if hall_capacity is None:
            return 25
        
        ratio = hall_capacity / event_guests
        
        if 1.0 <= ratio <= 1.2:
            return 100
        elif 0.8 <= ratio < 1.0:
            return 70
        elif 1.2 < ratio <= 1.5:
            return 85
        elif ratio > 1.5:
            return max(50 - (ratio - 1.5) * 10, 20)
        else:
            return max(30 - (1.0 - ratio) * 50, 0)
    
    def calculate_budget_score(self, event_budget, hall_price):
        """Calculate budget compatibility score"""
        if event_budget is None or hall_price is None:
            return 50
        
        price_ratio = hall_price / event_budget
        
        if price_ratio <= 0.7:
            return 100
        elif price_ratio <= 0.85:
            return 90
        elif price_ratio <= 1.0:
            return 80
        elif price_ratio <= 1.15:
            return 50
        elif price_ratio <= 1.3:
            return 30
        else:
            return 10
    
    def calculate_event_type_score(self, event_type, event_name, hotel_description):
        """Calculate event type matching"""
        if not hotel_description:
            return 50
        
        try:
            event_text = f"{event_type} {event_name}".lower()
            hotel_text = hotel_description.lower()
            
            event_keywords = set(re.findall(r'\w+', event_text))
            hotel_keywords = set(re.findall(r'\w+', hotel_text))
            
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            event_keywords -= stop_words
            hotel_keywords -= stop_words
            
            common_keywords = event_keywords & hotel_keywords
            
            if len(common_keywords) > 0:
                match_ratio = len(common_keywords) / len(event_keywords) if event_keywords else 0
                return min(100, 60 + match_ratio * 40)
            
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
        """Generate human-readable reasons"""
        reasons = []
        
        if scores['location'] >= 90:
            reasons.append("Perfect location match")
        elif scores['location'] >= 50:
            reasons.append("Nearby location")
        elif scores['location'] >= 30:
            reasons.append("In the same region")
        
        if hall and hall.get('capacity'):
            if scores['capacity'] >= 90:
                reasons.append(f"Ideal hall capacity for {event['guest_count']} guests")
            elif scores['capacity'] >= 70:
                reasons.append(f"Hall can accommodate {event['guest_count']} guests")
            elif scores['capacity'] >= 50:
                reasons.append(f"Hall available (capacity: {hall['capacity']})")
        
        if scores['budget'] >= 90:
            reasons.append("Excellent value - Great savings!")
        elif scores['budget'] >= 80:
            reasons.append("Within your budget")
        elif scores['budget'] >= 50:
            reasons.append("Slightly above budget")
        
        if scores['event_type'] >= 70:
            reasons.append(f"Perfect for {event['event_type']} events")
        elif scores['event_type'] >= 60:
            reasons.append(f"Suitable for {event['event_type']}")
        
        return reasons
    
    def recommend_venues(self, events, hotels, halls):
        """Generate recommendations"""
        recommendations = []
        
        for event in events:
            for hotel in hotels:
                hotel_halls = [h for h in halls if h['hotel_id'] == hotel['id']]
                
                if not hotel_halls:
                    scores = {
                        'location': self.calculate_location_score(event['location'], hotel['city']),
                        'capacity': 50,
                        'budget': 50,
                        'event_type': self.calculate_event_type_score(
                            event['event_type'], 
                            event['event_name'], 
                            hotel.get('description', '')
                        )
                    }
                    
                    overall_score = self.calculate_overall_score(scores)
                    
                    if overall_score >= 40:
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
                        
                        if overall_score >= 40:
                            recommendations.append({
                                'hotel': hotel,
                                'hall': hall,
                                'event': event,
                                'matchScore': overall_score,
                                'reasons': self.generate_reasons(scores, event, hotel, hall),
                                'confidence': overall_score / 100,
                                'scores': scores
                            })
        
        recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
        return recommendations

class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()
    
    def do_GET(self):
        try:
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return
            
            token = auth_header.split(' ')[1]
            
            headers = {
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {token}'
            }
            
            user_response = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
            
            if user_response.status_code != 200:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid token'}).encode())
                return
            
            user_data = user_response.json()
            user_id = user_data.get('id')
            
            events = supabase_query('events', '*', {'user_id': f'eq.{user_id}'})
            
            if not events:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'recommendations': [], 'message': 'No events found'}).encode())
                return
            
            hotels = supabase_query('hotels', '*')
            halls = supabase_query('hotel_halls', '*')
            
            engine = VenueRecommendationEngine()
            recommendations = engine.recommend_venues(events, hotels, halls)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'recommendations': recommendations,
                'count': len(recommendations)
            }).encode())
        
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
