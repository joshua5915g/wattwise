"""
Model Training Script for Solar Energy Output Prediction

Generates synthetic 365-day weather dataset with realistic correlations
and trains an XGBoost model to predict Solar Output Efficiency (0-100%).
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math
import random
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb


def generate_synthetic_dataset(days=365):
    """
    Generate synthetic weather and solar output data for training.
    
    Creates realistic correlations:
    - Higher cloud cover → Lower solar output
    - Higher temperature (optimal range) → Higher solar output
    - Lower humidity → Higher solar output
    - Hour of day → Solar cycle (peak at noon)
    - Day of year → Seasonal variations
    
    Args:
        days: Number of days to generate data for
        
    Returns:
        pandas DataFrame with features and target
    """
    print(f"Generating synthetic dataset for {days} days...")
    
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        day_of_year = current_date.timetuple().tm_yday
        
        # Generate hourly data for each day
        for hour in range(24):
            # Temperature with daily and seasonal cycles
            base_temp = 25  # Average temperature
            seasonal_variation = 5 * math.sin((day_of_year - 80) * 2 * math.pi / 365)  # Peak in summer
            daily_variation = 8 * math.sin((hour - 6) * math.pi / 12)  # Peak at 2 PM
            temperature = base_temp + seasonal_variation + daily_variation + random.uniform(-2, 2)
            
            # Cloud cover (0-100%)
            cloud_base = random.uniform(10, 70)
            cloud_cover = max(0, min(100, cloud_base - (temperature - 25) * 0.3))
            
            # Humidity correlated with cloud cover
            humidity_base = 40 + (cloud_cover * 0.4)
            humidity = max(30, min(95, humidity_base + random.uniform(-10, 10)))
            
            # Calculate Solar Output Efficiency (0-100%)
            # Base efficiency starts at 100%
            solar_efficiency = 100.0
            
            # 1. Hour of day effect (solar angle) - most important
            # No solar output at night (before 6 AM or after 6 PM)
            if hour < 6 or hour > 18:
                solar_efficiency = 0
            else:
                # Peak efficiency at noon (hour 12)
                hour_factor = math.sin((hour - 6) * math.pi / 12)
                solar_efficiency *= hour_factor
            
            # 2. Cloud cover effect (strong negative correlation)
            # Each % of cloud cover reduces efficiency
            cloud_penalty = (cloud_cover / 100) * 0.8  # Up to 80% reduction
            solar_efficiency *= (1 - cloud_penalty)
            
            # 3. Temperature effect (moderate positive, optimal range)
            # Optimal temperature around 25°C
            temp_factor = 1.0
            if temperature < 15:
                temp_factor = 0.7 + (temperature - 15) * 0.02  # Too cold
            elif temperature > 35:
                temp_factor = 1.0 - (temperature - 35) * 0.02  # Too hot (panel efficiency drops)
            else:
                temp_factor = 0.9 + (25 - abs(temperature - 25)) * 0.004  # Optimal range
            solar_efficiency *= temp_factor
            
            # 4. Humidity effect (slight negative correlation)
            humidity_penalty = (humidity - 30) / 100 * 0.15  # Up to 15% reduction
            solar_efficiency *= (1 - humidity_penalty)
            
            # 5. Seasonal effect (slightly better in summer due to sun angle)
            seasonal_factor = 0.95 + 0.1 * math.sin((day_of_year - 80) * 2 * math.pi / 365)
            solar_efficiency *= seasonal_factor
            
            # Add small random noise
            solar_efficiency += random.uniform(-2, 2)
            
            # Ensure bounds [0, 100]
            solar_efficiency = max(0, min(100, solar_efficiency))
            
            data.append({
                'temperature': round(temperature, 2),
                'cloud_cover': round(cloud_cover, 2),
                'humidity': round(humidity, 2),
                'hour_of_day': hour,
                'day_of_year': day_of_year,
                'solar_output_efficiency': round(solar_efficiency, 2)
            })
    
    df = pd.DataFrame(data)
    print(f"✓ Generated {len(df)} hourly records")
    print(f"  Date range: {days} days")
    print(f"  Features: temperature, cloud_cover, humidity, hour_of_day, day_of_year")
    print(f"  Target: solar_output_efficiency (0-100%)\n")
    
    return df


def train_model(df):
    """
    Train XGBoost model to predict solar output efficiency.
    
    Args:
        df: DataFrame with features and target
        
    Returns:
        Trained model, test metrics
    """
    print("Preparing data for training...")
    
    # Define features and target
    feature_columns = ['temperature', 'cloud_cover', 'humidity', 'hour_of_day', 'day_of_year']
    target_column = 'solar_output_efficiency'
    
    X = df[feature_columns]
    y = df[target_column]
    
    # Train/test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=True
    )
    
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples: {len(X_test)}\n")
    
    print("Training XGBoost model...")
    
    # XGBoost Regressor with tuned hyperparameters
    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror'
    )
    
    # Train the model
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    print("✓ Model training complete\n")
    
    # Evaluate model
    print("Evaluating model performance...")
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    rmse = math.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("="*60)
    print("MODEL PERFORMANCE METRICS")
    print("="*60)
    print(f"  RMSE (Root Mean Squared Error): {rmse:.2f}%")
    print(f"  MAE (Mean Absolute Error):      {mae:.2f}%")
    print(f"  R² Score:                        {r2:.4f}")
    print("="*60)
    print()
    
    # Feature importance
    print("Feature Importance:")
    importance_df = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in importance_df.iterrows():
        print(f"  {row['feature']:20s}: {row['importance']:.4f}")
    print()
    
    return model, {'rmse': rmse, 'mae': mae, 'r2': r2}


def save_model(model, model_dir='src/models'):
    """
    Save trained model to disk.
    
    Args:
        model: Trained XGBoost model
        model_dir: Directory to save model
        
    Returns:
        Path to saved model file
    """
    # Create models directory if it doesn't exist
    Path(model_dir).mkdir(parents=True, exist_ok=True)
    
    # Save model with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = f"{model_dir}/solar_prediction_model.pkl"
    
    joblib.dump(model, model_path)
    
    print(f"✓ Model saved to: {model_path}\n")
    
    return model_path


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("SOLAR ENERGY OUTPUT PREDICTION - MODEL TRAINING")
    print("="*60)
    print()
    
    # Generate synthetic dataset
    df = generate_synthetic_dataset(days=365)
    
    # Display dataset statistics
    print("Dataset Statistics:")
    print(df.describe())
    print()
    
    # Verify correlations
    print("Correlation with Solar Output:")
    correlations = df.corr()['solar_output_efficiency'].sort_values(ascending=False)
    for feature, corr in correlations.items():
        if feature != 'solar_output_efficiency':
            print(f"  {feature:20s}: {corr:+.3f}")
    print()
    
    # Train model
    model, metrics = train_model(df)
    
    # Save model
    model_path = save_model(model)
    
    print("="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print(f"Model saved successfully at: {model_path}")
    print(f"RMSE: {metrics['rmse']:.2f}% (Lower is better)")
    print(f"R² Score: {metrics['r2']:.4f} (Closer to 1.0 is better)")
    print("="*60)
    print()


if __name__ == "__main__":
    main()
