from http.server import BaseHTTPRequestHandler
import json
import random
from datetime import datetime
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            location = params.get('location', ['Mumbai, Maharashtra'])[0]
            
            # Location-specific base values (simplified version)
            location_data = self._get_location_data(location)
            
            # Generate realistic weather data with some randomness
            seed = int(datetime.now().timestamp()) % 100
            random.seed(seed)
            
            temperature = location_data['base_temp'] + random.uniform(-2, 2)
            humidity = location_data['base_humidity'] + random.uniform(-5, 5)
            uv_index = 6.0 + random.uniform(-1, 1)
            wind_speed = 12.0 + random.uniform(-3, 3)
            solar_index = 75.0 + random.uniform(-10, 10)
            
            # Prepare response
            response = {
                'location': location,
                'temperature': round(temperature, 1),
                'humidity': round(max(0, min(100, humidity)), 1),
                'uv_index': round(max(0, uv_index), 1),
                'wind_speed': round(max(0, wind_speed), 1),
                'solar_index': round(max(0, min(100, solar_index)), 1),
                'timestamp': datetime.now().isoformat()
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def _get_location_data(self, location):
        """Get base weather data for location"""
        # Simplified location data (full data would be imported from constants)
        locations = {
            "Mumbai, Maharashtra": {"base_temp": 28.0, "base_humidity": 70},
            "Delhi, NCR": {"base_temp": 25.0, "base_humidity": 55},
            "Bangalore, Karnataka": {"base_temp": 24.0, "base_humidity": 60},
            "Chennai, Tamil Nadu": {"base_temp": 30.0, "base_humidity": 75},
            # Add more as needed or import from constants
        }
        
        return locations.get(location, {"base_temp": 28.0, "base_humidity": 65})
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
