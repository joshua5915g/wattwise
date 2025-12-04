"""
Unit tests for the data ingestion module.

Tests verify synthetic weather data generation, validation, and database storage.
"""

import sys
import os
import sqlite3
import tempfile
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.data_ingestion import (
    SyntheticWeatherGenerator,
    WeatherDatabase,
    generate_and_store_weather
)


class TestSyntheticWeatherGenerator:
    """Test suite for SyntheticWeatherGenerator class"""
    
    def test_data_format_validation(self):
        """Test that generated data has correct fields and data types"""
        generator = SyntheticWeatherGenerator(city="TestCity")
        weather_data = generator.generate_weather_data()
        
        # Verify all required fields exist
        required_fields = ["temperature", "cloud_cover", "humidity", "city", "timestamp"]
        for field in required_fields:
            assert field in weather_data, f"Missing required field: {field}"
        
        # Verify data types
        assert isinstance(weather_data["temperature"], (int, float)), "Temperature should be numeric"
        assert isinstance(weather_data["cloud_cover"], (int, float)), "Cloud cover should be numeric"
        assert isinstance(weather_data["humidity"], (int, float)), "Humidity should be numeric"
        assert isinstance(weather_data["city"], str), "City should be a string"
        assert isinstance(weather_data["timestamp"], str), "Timestamp should be a string"
        
        # Verify city is correctly set
        assert weather_data["city"] == "TestCity", "City name should match initialization"
    
    def test_data_realism(self):
        """Test that generated values are within realistic ranges"""
        generator = SyntheticWeatherGenerator(city="TestCity")
        
        # Test multiple generations to ensure consistency
        for _ in range(10):
            weather_data = generator.generate_weather_data()
            
            # Temperature should be realistic (between 10°C and 45°C)
            assert 10 <= weather_data["temperature"] <= 45, \
                f"Temperature {weather_data['temperature']}°C is outside realistic range"
            
            # Cloud cover should be between 0 and 100%
            assert 0 <= weather_data["cloud_cover"] <= 100, \
                f"Cloud cover {weather_data['cloud_cover']}% is outside valid range"
            
            # Humidity should be between 0 and 100%
            assert 0 <= weather_data["humidity"] <= 100, \
                f"Humidity {weather_data['humidity']}% is outside valid range"
    
    def test_data_generation_consistency(self):
        """Test that multiple calls generate different but valid data"""
        generator = SyntheticWeatherGenerator(city="TestCity")
        
        # Generate multiple data points
        data_points = [generator.generate_weather_data() for _ in range(5)]
        
        # Verify all are valid
        for data in data_points:
            assert "temperature" in data
            assert "cloud_cover" in data
            assert "humidity" in data
        
        # Verify they are not all identical (should have some variation)
        temperatures = [d["temperature"] for d in data_points]
        # At least some variation should exist (not all exactly the same)
        assert len(set(temperatures)) > 1 or abs(max(temperatures) - min(temperatures)) > 0, \
            "Generated data should have natural variation"


class TestWeatherDatabase:
    """Test suite for WeatherDatabase class"""
    
    def test_database_initialization(self):
        """Test that database and table are created correctly"""
        # Use temporary directory for testing
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = os.path.join(temp_dir, "test_weather.db")
            
            # Initialize database
            db = WeatherDatabase(db_path=db_path)
            
            # Verify database file exists
            assert os.path.exists(db_path), "Database file should be created"
            
            # Verify table exists with correct schema
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='weather_data'
            """)
            assert cursor.fetchone() is not None, "weather_data table should exist"
            conn.close()
    
    def test_database_insertion(self):
        """Test that data is correctly stored with timestamp"""
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = os.path.join(temp_dir, "test_weather.db")
            db = WeatherDatabase(db_path=db_path)
            
            # Create test data
            test_data = {
                "timestamp": "2024-01-01T12:00:00",
                "temperature": 25.5,
                "cloud_cover": 60.0,
                "humidity": 70.0,
                "city": "TestCity"
            }
            
            # Insert data
            success = db.insert_weather_data(test_data)
            assert success, "Data insertion should succeed"
            
            # Verify data was stored
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM weather_data WHERE city='TestCity'")
            result = cursor.fetchone()
            conn.close()
            
            assert result is not None, "Inserted data should be retrievable"
            assert result[2] == 25.5, "Temperature should be stored correctly"
            assert result[3] == 60.0, "Cloud cover should be stored correctly"
            assert result[4] == 70.0, "Humidity should be stored correctly"
    
    def test_get_latest_records(self):
        """Test retrieving latest weather records"""
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = os.path.join(temp_dir, "test_weather.db")
            db = WeatherDatabase(db_path=db_path)
            
            # Insert multiple records
            for i in range(5):
                test_data = {
                    "timestamp": f"2024-01-01T12:0{i}:00",
                    "temperature": 25.0 + i,
                    "cloud_cover": 50.0,
                    "humidity": 60.0,
                    "city": "TestCity"
                }
                db.insert_weather_data(test_data)
            
            # Retrieve latest 3 records
            latest = db.get_latest_records(limit=3)
            
            assert len(latest) == 3, "Should retrieve exactly 3 records"
            # Latest should be in descending order (most recent first)
            assert latest[0]["temperature"] == 29.0, "Latest record should be most recent"


class TestETLPipeline:
    """Test suite for the complete ETL pipeline"""
    
    def test_generate_and_store_weather(self):
        """Test the complete ETL process"""
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = os.path.join(temp_dir, "test_weather.db")
            
            # Run ETL pipeline
            result = generate_and_store_weather(city="TestCity", db_path=db_path)
            
            # Verify function returns data
            assert result is not None, "ETL should return weather data"
            assert "temperature" in result, "Result should contain temperature"
            
            # Verify data was stored in database
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM weather_data")
            count = cursor.fetchone()[0]
            conn.close()
            
            assert count == 1, "Exactly one record should be stored"


if __name__ == "__main__":
    # Run tests manually if pytest not available
    import traceback
    
    test_classes = [
        TestSyntheticWeatherGenerator,
        TestWeatherDatabase,
        TestETLPipeline
    ]
    
    passed = 0
    failed = 0
    
    for test_class in test_classes:
        print(f"\n{'='*60}")
        print(f"Running {test_class.__name__}")
        print('='*60)
        
        instance = test_class()
        test_methods = [m for m in dir(instance) if m.startswith('test_')]
        
        for method_name in test_methods:
            try:
                print(f"  ✓ {method_name}...", end=" ")
                method = getattr(instance, method_name)
                method()
                print("PASSED")
                passed += 1
            except AssertionError as e:
                print(f"FAILED: {e}")
                failed += 1
            except Exception as e:
                print(f"ERROR: {e}")
                traceback.print_exc()
                failed += 1
    
    print(f"\n{'='*60}")
    print(f"Test Results: {passed} passed, {failed} failed")
    print('='*60)
