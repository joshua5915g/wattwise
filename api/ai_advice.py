from http.server import BaseHTTPRequestHandler
import json
import os

try:
    import google.generativeai as genai
except ImportError:
    genai = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Extract parameters
            solar_efficiency = float(data.get('solar_efficiency', 70.0))
            temperature = float(data.get('temperature', 28.0 ))
            cloud_cover = float(data.get('cloud_cover', 30.0))
            daily_output = float(data.get('daily_output', 25.0))
            
            # Get API key from environment
            api_key = os.environ.get('GEMINI_API_KEY', '')
            
            if not api_key or not genai:
                # Fallback response if API key not available
                advice = self._get_fallback_advice(solar_efficiency, temperature, cloud_cover, daily_output)
                response = {
                    'advice': advice,
                    'appliance_recommendations': self._get_appliance_recommendations(solar_efficiency),
                    'optimal_hours': '10:00 AM - 2:00 PM' if solar_efficiency > 60 else '11:00 AM - 1:00 PM'
                }
            else:
                # Use Gemini AI
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')
                
                prompt = f"""
                You are an energy efficiency advisor for a solar panel system.
                
                Current conditions:
                - Solar efficiency: {solar_efficiency:.1f}%
                - Temperature: {temperature:.1f}°C
                - Cloud cover: {cloud_cover:.1f}%
                - Daily output: {daily_output:.1f} kWh
                
                Provide a brief (2-3 sentences) actionable advice for the homeowner to maximize solar energy usage.
                Be specific about which appliances to run and what time windows are optimal.
                """
                
                result = model.generate_content(prompt)
                advice_text = result.text
                
                response = {
                    'advice': advice_text,
                    'appliance_recommendations': self._get_appliance_recommendations(solar_efficiency),
                    'optimal_hours': self._get_optimal_hours(solar_efficiency)
                }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            # Fallback in case of error
            fallback_response = {
                'advice': self._get_fallback_advice(70, 28, 30, 25),
                'appliance_recommendations': ['Washing machine', 'Dishwasher'],
                'optimal_hours': '10:00 AM - 2:00 PM'
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(fallback_response).encode('utf-8'))
    
    def _get_fallback_advice(self, efficiency, temp, cloud, output):
        """Generate rule-based advice if AI is unavailable"""
        if efficiency >= 70:
            return (f"Excellent solar conditions! With {efficiency:.0f}% efficiency, "
                   "run energy-intensive appliances like washing machines, dryers, and water heaters "
                   "between 10 AM - 2 PM to maximize solar savings.")
        elif efficiency >= 40:
            return (f"Moderate solar output at {efficiency:.0f}% efficiency. "
                   "Focus on running essential appliances during peak sun hours (11 AM - 1 PM). "
                   "Consider delaying heavy loads until conditions improve.")
        else:
            return (f"Low solar efficiency at {efficiency:.0f}% due to weather conditions. "
                   "Minimize non-essential power usage. Store solar energy if you have batteries, "
                   "or plan to run appliances later when conditions improve.")
    
    def _get_appliance_recommendations(self, efficiency):
        """Get appliance recommendations based on efficiency"""
        if efficiency >= 70:
            return ['Washing machine', 'Dishwasher', 'Water heater', 'EV charger', 'Dryer']
        elif efficiency >= 40:
            return ['Washing machine', 'Dishwasher', 'Water heater']
        else:
            return ['Essential appliances only']
    
    def _get_optimal_hours(self, efficiency):
        """Get optimal usage hours based on efficiency"""
        if efficiency >= 70:
            return '9:00 AM - 3:00 PM'
        elif efficiency >= 40:
            return '10:00 AM - 2:00 PM'
        else:
            return '11:00 AM - 1:00 PM'
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
