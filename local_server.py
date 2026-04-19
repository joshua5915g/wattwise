import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Import endpoints
sys.path.insert(0, os.path.dirname(__file__))

from api.predict import handler as PredictHandler
from api.weather import handler as WeatherHandler
from api.ai_advice import handler as AIAdviceHandler

class DynamicRouter(SimpleHTTPRequestHandler):
    def get_handler(self):
        # Route to appropriate handler based on path
        if self.path.startswith('/api/predict'):
            return PredictHandler
        elif self.path.startswith('/api/weather'):
            return WeatherHandler
        elif self.path.startswith('/api/ai_advice'):
            return AIAdviceHandler
        else:
            return None

    def route_request(self, method):
        handler_class = self.get_handler()
        if handler_class:
            # Instantiate handler and delegate method
            h = handler_class(self.request, self.client_address, self.server)
            method_func = getattr(h, f'do_{method}')
            method_func()
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "Not Found"}')

    def do_GET(self):
        self.route_request('GET')

    def do_POST(self):
        self.route_request('POST')

    def do_OPTIONS(self):
        self.route_request('OPTIONS')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Local Vercel API Server running on port {port}...")
    httpd = HTTPServer(('127.0.0.1', port), DynamicRouter)
    httpd.serve_forever()
