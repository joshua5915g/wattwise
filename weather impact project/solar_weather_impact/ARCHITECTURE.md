# Solar Energy Impact Prediction System Architecture

## Project Overview
This project aims to predict solar energy output based on weather forecasts using a Python-based stack including SQLite, OpenWeatherMap API, XGBoost, and Streamlit.

## Directory Structure

The project follows a modular architecture to separate data ingestion, processing, modeling, and the application layer.

```text
solar_weather_impact/
├── data/                   # Data storage
│   ├── raw/                # Raw data from API
│   ├── processed/          # Cleaned and feature-engineered data
│   └── database.sqlite     # SQLite database for persistent storage
├── src/                    # Source code for the core logic
│   ├── data/               # Data pipeline modules
│   │   ├── collector.py    # OpenWeatherMap API interaction
│   │   ├── processor.py    # Data cleaning and transformation
│   │   └── __init__.py
│   ├── models/             # Machine learning model logic
│   │   ├── train.py        # XGBoost training script
│   │   ├── predict.py      # Inference logic
│   │   └── __init__.py
│   └── utils/              # Helper functions and configuration
│       ├── config.py       # API keys and constants
│       └── __init__.py
├── app/                    # Streamlit Dashboard
│   └── dashboard.py        # Main dashboard application
├── notebooks/              # Jupyter notebooks for experimentation
├── tests/                  # Unit and integration tests
├── requirements.txt        # Project dependencies
└── ARCHITECTURE.md         # This documentation
```

## Modules Description

### 1. Data Pipeline (`src/data/`)
- **collector.py**: Handles fetching weather data from OpenWeatherMap API.
- **processor.py**: Handles data cleaning, normalization, and preparation for the model.

### 2. Model Training (`src/models/`)
- **train.py**: Script to train the XGBoost model on historical data.
- **predict.py**: Functions to load the trained model and generate predictions.

### 3. Dashboard App (`app/`)
- **dashboard.py**: A Streamlit application to visualize weather forecasts and predicted solar energy output.

### 4. Database
- **SQLite**: Used to store historical weather data and prediction logs.
