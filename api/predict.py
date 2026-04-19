from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    import joblib
    import numpy as np
    import pandas as pd
    from pathlib import Path
except ImportError as e:
    print(f"Import error: {e}", file=sys.stderr)

# Global model cache
_model = None

def load_model():
    """Load and cache the ML model"""
    global _model
    if _model is None:
        try:
            model_path = Path(__file__).parent.parent / 'src' / 'models' / 'solar_prediction_model.pkl'
            _model = joblib.load(str(model_path))
            print("Model loaded successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            raise
    return _model

def predict_for_hour(model, temperature, cloud_cover, humidity, hour, day_of_year):
    """Predict solar efficiency for a specific hour"""
    features = pd.DataFrame({
        'temperature': [temperature],
        'cloud_cover': [cloud_cover],
        'humidity': [humidity],
        'hour_of_day': [hour],
        'day_of_year': [day_of_year]
    })
    
    efficiency = float(model.predict(features)[0])
    return max(0, efficiency)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Extract parameters
            temperature = float(data.get('temperature', 28.0))
            cloud_cover = float(data.get('cloud_cover', 30.0))
            humidity = float(data.get('humidity', 65.0))
            panel_capacity = float(data.get('panel_capacity', 5.0))
            day_of_year = int(data.get('day_of_year', 1))
            
            # Load model
            model = load_model()
            
            # Generate predictions for all 24 hours
            hourly_outputs = []
            for hour in range(24):
                efficiency = predict_for_hour(
                    model, temperature, cloud_cover, humidity, hour, day_of_year
                )
                # Calculate actual kWh output
                output = (efficiency / 100) * panel_capacity
                hourly_outputs.append(round(output, 3))
            
            # Calculate metrics
            total_daily_output = sum(hourly_outputs)
            peak_output = max(hourly_outputs)
            peak_hour = hourly_outputs.index(peak_output)
            
            # Calculate efficiency percentage
            max_possible_output = panel_capacity * 8  # 8 peak sun hours
            efficiency_percent = (total_daily_output / max_possible_output) * 100 if max_possible_output > 0 else 0
            
            # Prepare response
            response = {
                'hourly_output': hourly_outputs,
                'total_daily_output': round(total_daily_output, 2),
                'peak_hour': peak_hour,
                'peak_output': round(peak_output, 2),
                'efficiency_percent': round(efficiency_percent, 2)
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error in prediction endpoint: {e}", file=sys.stderr)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
