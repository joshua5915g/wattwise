"""
Utility functions for Solar Energy Impact Prediction System

This module provides helper functions including AI-powered weather advice
generation using Google Gemini Flash API.
"""

import google.generativeai as genai
from typing import Dict, Optional


def generate_weather_advice(prediction_data: Dict, api_key: str) -> str:
    """
    Generate witty, actionable weather advice using Google Gemini Flash.
    
    Args:
        prediction_data: Dictionary containing:
            - solar_efficiency: Predicted solar output efficiency (0-100%)
            - temperature: Temperature in Celsius
            - cloud_cover: Cloud coverage percentage (0-100%)
            - humidity: Humidity percentage (0-100%)
            - hour_of_day: Hour of day (0-23)
            - confidence_interval: Tuple of (lower, upper) bounds
        api_key: Google Gemini API key
    
    Returns:
        String containing witty, actionable advice for homeowners
    """
    try:
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Use Gemini Flash (fast and cheap)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare the prompt with prediction data
        solar_efficiency = prediction_data.get('solar_efficiency', 0)
        temperature = prediction_data.get('temperature', 0)
        cloud_cover = prediction_data.get('cloud_cover', 0)
        humidity = prediction_data.get('humidity', 0)
        hour_of_day = prediction_data.get('hour_of_day', 12)
        confidence_lower = prediction_data.get('confidence_lower', 0)
        confidence_upper = prediction_data.get('confidence_upper', 0)
        
        # System prompt for witty energy consultant
        system_prompt = """You are an energy consultant. Based on this solar output prediction, 
give a 1-sentence actionable recommendation for a homeowner (e.g., "Run your washing machine at 2 PM"). 
Keep it witty and fun, but genuinely helpful."""
        
        # User prompt with actual data
        user_prompt = f"""
Solar Output Prediction:
- Predicted Efficiency: {solar_efficiency:.1f}%
- Confidence Interval: {confidence_lower:.1f}% - {confidence_upper:.1f}%
- Temperature: {temperature}°C
- Cloud Cover: {cloud_cover}%
- Humidity: {humidity}%
- Time of Day: {hour_of_day}:00

Based on this data, provide one witty, actionable recommendation for a homeowner.
"""
        
        # Generate response
        response = model.generate_content(
            f"{system_prompt}\n\n{user_prompt}",
            generation_config={
                'temperature': 0.9,  # More creative
                'top_p': 0.95,
                'max_output_tokens': 100,
            }
        )
        
        advice = response.text.strip()
        
        # Remove quotes if present
        if advice.startswith('"') and advice.endswith('"'):
            advice = advice[1:-1]
        
        return advice
        
    except Exception as e:
        # Fallback advice if API fails
        if solar_efficiency > 70:
            return "🌞 Stellar solar conditions! Perfect time to run energy-hungry appliances and show your utility company who's boss."
        elif solar_efficiency > 40:
            return "☀️ Decent solar output today. Maybe save the heavy stuff for noon, but you're good to go!"
        else:
            return "☁️ Solar panels taking a coffee break today. Consider running major appliances during peak sun hours (or just blame it on the clouds)."


def get_time_emoji(hour: int) -> str:
    """
    Get appropriate emoji for time of day.
    
    Args:
        hour: Hour of day (0-23)
    
    Returns:
        Emoji representing time of day
    """
    if 5 <= hour < 8:
        return "🌅"  # Sunrise
    elif 8 <= hour < 12:
        return "🌤️"  # Morning
    elif 12 <= hour < 17:
        return "☀️"  # Afternoon
    elif 17 <= hour < 20:
        return "🌆"  # Evening
    else:
        return "🌙"  # Night


def categorize_efficiency(efficiency: float) -> str:
    """
    Categorize solar efficiency into descriptive labels.
    
    Args:
        efficiency: Solar output efficiency (0-100%)
    
    Returns:
        Descriptive category string
    """
    if efficiency >= 80:
        return "Excellent ⭐⭐⭐"
    elif efficiency >= 60:
        return "Good ⭐⭐"
    elif efficiency >= 40:
        return "Moderate ⭐"
    elif efficiency >= 20:
        return "Low ☁️"
    else:
        return "Very Low 🌧️"
