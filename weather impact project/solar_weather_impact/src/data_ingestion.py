"""
Data Ingestion Module for Solar Energy Impact Prediction System

This module provides synthetic weather data generation and SQLite database storage.
No external API dependencies required.
"""

import sqlite3
import random
import math
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional


class SyntheticWeatherGenerator:
    """
    Generates realistic synthetic weather data for testing and development.
    
    Simulates daily temperature cycles, correlated cloud cover and humidity,
    and natural randomness to create realistic weather patterns.
    """
    
    def __init__(self, city: str = "Mumbai"):
        """
        Initialize the weather generator.
        
        Args:
            city: Name of the city for reference (used in database)
        """
        self.city = city
        
    def generate_weather_data(self) -> Dict[str, any]:
        """
        Generate a single synthetic weather data point.
        
        Returns:
            Dictionary containing:
                - temperature: Temperature in Celsius (realistic range)
                - cloud_cover: Cloud coverage percentage (0-100)
                - humidity: Relative humidity percentage (0-100)
                - city: City name
                - timestamp: Current timestamp
        """
        # Get current hour to simulate daily temperature cycle
        current_hour = datetime.now().hour
        
        # Base temperature with daily cycle (cooler at night, warmer during day)
        # Using sine wave for realistic daily temperature variation
        base_temp = 25  # Average temperature
        temp_variation = 8  # Temperature swing
        daily_cycle = math.sin((current_hour - 6) * math.pi / 12)  # Peak at 2 PM
        temperature = base_temp + (temp_variation * daily_cycle) + random.uniform(-2, 2)
        
        # Cloud cover (0-100%)
        # Higher temperatures slightly reduce cloud cover probability
        cloud_base = random.uniform(10, 70)
        cloud_cover = max(0, min(100, cloud_base - (temperature - 25) * 0.5))
        
        # Humidity correlated with cloud cover
        # More clouds generally mean higher humidity
        humidity_base = 40 + (cloud_cover * 0.4)
        humidity = max(30, min(95, humidity_base + random.uniform(-10, 10)))
        
        return {
            "temperature": round(temperature, 2),
            "cloud_cover": round(cloud_cover, 2),
            "humidity": round(humidity, 2),
            "city": self.city,
            "timestamp": datetime.now().isoformat()
        }


class WeatherDatabase:
    """
    Manages SQLite database operations for weather data storage.
    """
    
    def __init__(self, db_path: str = "data/weather.db"):
        """
        Initialize database connection and create table if not exists.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        
        # Create data directory if it doesn't exist
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database schema
        self._initialize_database()
    
    def _initialize_database(self):
        """Create weather_data table if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weather_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                temperature REAL NOT NULL,
                cloud_cover REAL NOT NULL,
                humidity REAL NOT NULL,
                city TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def insert_weather_data(self, weather_data: Dict[str, any]) -> bool:
        """
        Insert weather data into the database.
        
        Args:
            weather_data: Dictionary containing weather information
            
        Returns:
            True if insertion successful, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO weather_data (timestamp, temperature, cloud_cover, humidity, city)
                VALUES (?, ?, ?, ?, ?)
            """, (
                weather_data["timestamp"],
                weather_data["temperature"],
                weather_data["cloud_cover"],
                weather_data["humidity"],
                weather_data["city"]
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Database insertion error: {e}")
            return False
    
    def get_latest_records(self, limit: int = 10) -> list:
        """
        Retrieve the latest weather records.
        
        Args:
            limit: Number of records to retrieve
            
        Returns:
            List of weather records as dictionaries
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, timestamp, temperature, cloud_cover, humidity, city
            FROM weather_data
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        
        columns = ["id", "timestamp", "temperature", "cloud_cover", "humidity", "city"]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return results


def generate_and_store_weather(city: str = "Mumbai", db_path: str = "data/weather.db") -> Optional[Dict]:
    """
    Main ETL function: Generate synthetic weather data and store in database.
    
    Args:
        city: City name for weather data
        db_path: Path to SQLite database
        
    Returns:
        Generated weather data dictionary if successful, None otherwise
    """
    # Generate weather data
    generator = SyntheticWeatherGenerator(city=city)
    weather_data = generator.generate_weather_data()
    
    # Validate data format
    required_fields = ["temperature", "cloud_cover", "humidity", "city", "timestamp"]
    if not all(field in weather_data for field in required_fields):
        print("Error: Generated data missing required fields")
        return None
    
    # Store in database
    db = WeatherDatabase(db_path=db_path)
    success = db.insert_weather_data(weather_data)
    
    if success:
        print(f"✓ Weather data stored successfully for {city}")
        print(f"  Temperature: {weather_data['temperature']}°C")
        print(f"  Cloud Cover: {weather_data['cloud_cover']}%")
        print(f"  Humidity: {weather_data['humidity']}%")
        return weather_data
    else:
        print("✗ Failed to store weather data")
        return None


if __name__ == "__main__":
    # Example usage
    print("Generating and storing synthetic weather data...\n")
    data = generate_and_store_weather(city="Mumbai")
    
    if data:
        print("\n" + "="*50)
        print("Retrieving latest records from database:")
        print("="*50)
        
        db = WeatherDatabase()
        latest = db.get_latest_records(limit=5)
        
        for record in latest:
            print(f"\nID: {record['id']}")
            print(f"  Timestamp: {record['timestamp']}")
            print(f"  City: {record['city']}")
            print(f"  Temperature: {record['temperature']}°C")
            print(f"  Cloud Cover: {record['cloud_cover']}%")
            print(f"  Humidity: {record['humidity']}%")
