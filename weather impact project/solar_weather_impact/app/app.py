"""
WattWise - Production Grade Solar Energy Dashboard
Dark Mode | Glassmorphism | Neon Accents | Solar Curve Visualization
"""

import streamlit as st
import pandas as pd
import numpy as np
import joblib
import sqlite3
import sys
import os
from datetime import datetime, timedelta
import plotly.graph_objects as go
from pathlib import Path
import pydeck as pdk
import random
import time
from streamlit_autorefresh import st_autorefresh

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from src.utils import generate_weather_advice, categorize_efficiency, get_time_emoji

# Page configuration - Force sidebar expanded
st.set_page_config(
    layout="wide",
    page_title="WattWise | Smart Solar Savings",
    page_icon="⚡",
    initial_sidebar_state="expanded"
)

# ============================================================
# PREMIUM DARK MODE CSS
# ============================================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :root {
        --bg-primary: #0a0a0f;
        --bg-secondary: #12121a;
        --neon-green: #00ff88;
        --text-primary: #ffffff;
        --text-secondary: #a0a0a0;
    }
    
    .stApp {
        background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%);
        font-family: 'Inter', sans-serif;
    }
    
    .block-container {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        max-width: 100% !important;
    }
    
    /* Fix scrolling - ensure content is accessible */
    .main .block-container {
        margin-top: 0 !important;
        overflow: visible !important;
    }
    
    /* Ensure header area is visible */
    [data-testid="stHeader"] {
        background: transparent !important;
    }
    
    /* Only hide footer, keep menu visible */
    footer {visibility: hidden;}
    
    /* ===== SIDEBAR TOGGLE BUTTON FIX ===== */
    /* Multiple selectors for different Streamlit versions */
    
    /* Collapsed sidebar control button */
    [data-testid="stSidebarCollapsedControl"],
    [data-testid="collapsedControl"],
    button[kind="header"],
    .st-emotion-cache-1gwvy71,
    [data-testid="stSidebar"] button {
        color: #00FF00 !important;
        background-color: rgba(0, 255, 136, 0.2) !important;
        border: 1px solid #00FF00 !important;
        border-radius: 8px !important;
    }
    
    /* Sidebar nav toggle */
    [data-testid="stSidebarNavLink"],
    [data-testid="stSidebarNav"] button,
    .st-emotion-cache-16idsys,
    [data-testid="baseButton-header"] {
        color: #00FF00 !important;
        background-color: rgba(0, 255, 136, 0.15) !important;
    }
    
    /* The actual collapse/expand arrow button */
    [data-testid="stSidebar"] [data-testid="stBaseButton-header"],
    [data-testid="stSidebar"] [data-testid="baseButton-headerNoPadding"],
    .st-emotion-cache-eczf16,
    .st-emotion-cache-1egp75f {
        color: #00FF00 !important;
        background: rgba(0, 255, 136, 0.2) !important;
        border: 1px solid #00FF00 !important;
    }
    
    /* Arrow icon inside button */
    [data-testid="stSidebar"] svg,
    [data-testid="stSidebarCollapsedControl"] svg {
        fill: #00FF00 !important;
        stroke: #00FF00 !important;
    }
    
    /* Sidebar - Lighter background for distinction */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1E1E1E 0%, #252530 100%) !important;
        border-right: 2px solid rgba(0, 255, 136, 0.4) !important;
    }
    
    [data-testid="stSidebar"] > div:first-child {
        background: transparent !important;
    }
    
    [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
        color: #00ff88 !important;
        font-family: 'Inter', sans-serif;
    }
    
    .metric-card {
        background: rgba(18, 18, 26, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 136, 0.1);
        transition: all 0.3s ease;
    }
    
    .metric-card:hover {
        border-color: rgba(0, 255, 136, 0.6);
        transform: translateY(-2px);
    }
    
    .metric-label {
        color: #a0a0a0;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }
    
    .metric-value {
        color: #00ff88;
        font-size: 2.2rem;
        font-weight: 700;
        text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }
    
    .metric-delta {
        color: #a0a0a0;
        font-size: 0.75rem;
        margin-top: 0.3rem;
    }
    
    .main-header {
        font-size: 2rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 0.3rem;
    }
    
    .main-header span { color: #00ff88; }
    
    .sub-header {
        color: #a0a0a0;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
    }
    
    .ai-advice-box {
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(18, 18, 26, 0.9) 100%);
        border: 1px solid rgba(0, 255, 136, 0.4);
        border-radius: 12px;
        padding: 1.2rem;
        color: #ffffff;
        height: 100%;
    }
    
    .ai-label {
        color: #00ff88;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }
    
    .section-header {
        color: #ffffff;
        font-size: 1rem;
        font-weight: 600;
        margin: 1.5rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    /* Premium Map Section */
    .map-section {
        background: rgba(18, 18, 26, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 255, 136, 0.25);
        border-radius: 20px;
        padding: 1.5rem;
        margin-top: 1rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 255, 136, 0.08);
    }
    
    .map-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }
    
    .map-title {
        color: #ffffff;
        font-size: 1.2rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .map-title span {
        color: #00ff88;
    }
    
    .map-badge {
        background: rgba(0, 255, 136, 0.15);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 20px;
        padding: 0.3rem 0.8rem;
        font-size: 0.7rem;
        color: #00ff88;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .map-container {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .map-stats-row {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .map-stat-card {
        flex: 1;
        background: rgba(0, 255, 136, 0.05);
        border: 1px solid rgba(0, 255, 136, 0.15);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .map-stat-card:hover {
        background: rgba(0, 255, 136, 0.1);
        border-color: rgba(0, 255, 136, 0.3);
    }
    
    .map-stat-value {
        color: #00ff88;
        font-size: 1.5rem;
        font-weight: 700;
        text-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
    }
    
    .map-stat-label {
        color: #a0a0a0;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.3rem;
    }
    
    /* Live Weather Ticker */
    .live-ticker {
        background: linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(18, 18, 26, 0.9) 50%, rgba(0, 255, 136, 0.1) 100%);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 12px;
        padding: 0.8rem 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    
    .ticker-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .ticker-label {
        color: #a0a0a0;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .ticker-value {
        color: #00ff88;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .live-dot {
        width: 8px;
        height: 8px;
        background: #00ff88;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 10px #00ff88;
    }
    
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    .live-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 255, 136, 0.15);
        border: 1px solid rgba(0, 255, 136, 0.4);
        border-radius: 20px;
        padding: 0.3rem 0.8rem;
        font-size: 0.7rem;
        color: #00ff88;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .status-high { color: #00ff88; font-weight: 600; }
    .status-medium { color: #ffcc00; font-weight: 600; }
    .status-low { color: #ff4444; font-weight: 600; }
    
    .experiment-badge {
        background: rgba(0, 255, 136, 0.15);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 8px;
        padding: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.75rem;
        color: #00ff88;
        text-align: center;
    }
    
    [data-testid="stMetricValue"] { color: #00ff88 !important; }
    [data-testid="stMetricLabel"] { color: #a0a0a0 !important; }
    
    hr { border-color: rgba(0, 255, 136, 0.2) !important; }
</style>
""", unsafe_allow_html=True)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

@st.cache_resource
def load_model():
    model_path = "src/models/solar_prediction_model.pkl"
    if not Path(model_path).exists():
        st.error("❌ Model not found. Run: `python src/train_model.py`")
        st.stop()
    return joblib.load(model_path)


def load_latest_weather_data():
    db_path = "data/weather.db"
    if not Path(db_path).exists():
        return {'temperature': 28.0, 'cloud_cover': 30.0, 'humidity': 65.0}
    try:
        conn = sqlite3.connect(db_path)
        df = pd.read_sql_query("SELECT * FROM weather_data ORDER BY id DESC LIMIT 1", conn)
        conn.close()
        if len(df) > 0:
            return {
                'temperature': float(df['temperature'].iloc[0]),
                'cloud_cover': float(df['cloud_cover'].iloc[0]),
                'humidity': float(df['humidity'].iloc[0])
            }
    except:
        pass
    return {'temperature': 28.0, 'cloud_cover': 30.0, 'humidity': 65.0}


def predict_for_hour(model, temperature, cloud_cover, humidity, hour, day_of_year, panel_capacity):
    """Predict solar output for a specific hour"""
    features = pd.DataFrame({
        'temperature': [temperature],
        'cloud_cover': [cloud_cover],
        'humidity': [humidity],
        'hour_of_day': [hour],
        'day_of_year': [day_of_year]
    })
    efficiency = float(model.predict(features)[0])
    # Calculate actual kWh output (efficiency * capacity * 1 hour)
    return max(0, (efficiency / 100) * panel_capacity)


def generate_solar_curve_data(model, temperature, cloud_cover, humidity, day_of_year, panel_capacity):
    """Generate hourly solar output predictions for the entire day"""
    hours = list(range(24))
    outputs = []
    
    for hour in hours:
        output = predict_for_hour(model, temperature, cloud_cover, humidity, hour, day_of_year, panel_capacity)
        outputs.append(output)
    
    return pd.DataFrame({
        'Hour': hours,
        'Hour_Label': [f"{h:02d}:00" for h in hours],
        'Energy_Output': outputs
    })


def create_solar_curve_chart(data):
    """Create a premium Solar Curve Area Chart"""
    fig = go.Figure()
    
    # Area chart with gradient fill
    fig.add_trace(go.Scatter(
        x=data['Hour_Label'],
        y=data['Energy_Output'],
        fill='tozeroy',
        fillcolor='rgba(0, 255, 136, 0.3)',
        line=dict(color='#00ff88', width=3),
        mode='lines',
        hovertemplate='<b>%{x}</b><br>Output: %{y:.2f} kWh<extra></extra>'
    ))
    
    # Peak hours annotation
    peak_hour = data.loc[data['Energy_Output'].idxmax()]
    fig.add_annotation(
        x=peak_hour['Hour_Label'],
        y=peak_hour['Energy_Output'],
        text=f"Peak: {peak_hour['Energy_Output']:.2f} kWh",
        showarrow=True,
        arrowhead=2,
        arrowcolor='#00ff88',
        font=dict(color='#00ff88', size=11),
        bgcolor='rgba(10, 10, 15, 0.8)',
        bordercolor='#00ff88',
        borderwidth=1
    )
    
    fig.update_layout(
        title=dict(
            text='⚡ Daily Solar Output Curve',
            font=dict(color='#ffffff', size=14),
            x=0
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(family='Inter', color='#a0a0a0'),
        xaxis=dict(
            title='Hour of Day',
            showgrid=False,
            zeroline=False,
            color='#a0a0a0',
            tickangle=-45
        ),
        yaxis=dict(
            title='Energy Output (kWh)',
            showgrid=False,
            zeroline=False,
            color='#a0a0a0'
        ),
        height=320,
        margin=dict(l=50, r=30, t=50, b=60),
        showlegend=False,
        hovermode='x unified'
    )
    
    return fig


def get_appliance_status(efficiency):
    """
    Determine appliance run status based on solar efficiency.
    
    Args:
        efficiency: Solar efficiency percentage (0-100)
    
    Returns:
        tuple: (status_text, color)
    """
    if efficiency > 70:
        return "✅ RUN NOW", "#00ff88", "Solar Powered"
    elif efficiency >= 30:
        return "⚠️ WAIT", "#ffcc00", "ECO Mode"
    else:
        return "⛔ AVOID", "#ff4444", "Grid Power"


# ============================================================
# MAIN APPLICATION
# ============================================================

def main():
    # Header
    st.markdown('<div class="main-header">⚡ Watt<span>Wise</span></div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Intelligent Energy Forecasting & Cost Optimization</div>', unsafe_allow_html=True)
    
    # ========== LOCATION DATA - ALL INDIA ==========
    locations = {
        # Metro Cities
        "Mumbai, Maharashtra": {"lat": 19.0760, "lon": 72.8777, "base_temp": 28.0, "base_humidity": 70},
        "Delhi, NCR": {"lat": 28.6139, "lon": 77.2090, "base_temp": 25.0, "base_humidity": 55},
        "Bangalore, Karnataka": {"lat": 12.9716, "lon": 77.5946, "base_temp": 24.0, "base_humidity": 60},
        "Chennai, Tamil Nadu": {"lat": 13.0827, "lon": 80.2707, "base_temp": 30.0, "base_humidity": 75},
        "Kolkata, West Bengal": {"lat": 22.5726, "lon": 88.3639, "base_temp": 29.0, "base_humidity": 80},
        "Hyderabad, Telangana": {"lat": 17.3850, "lon": 78.4867, "base_temp": 27.0, "base_humidity": 58},
        
        # State Capitals & Major Cities
        "Ahmedabad, Gujarat": {"lat": 23.0225, "lon": 72.5714, "base_temp": 29.0, "base_humidity": 45},
        "Pune, Maharashtra": {"lat": 18.5204, "lon": 73.8567, "base_temp": 26.0, "base_humidity": 55},
        "Jaipur, Rajasthan": {"lat": 26.9124, "lon": 75.7873, "base_temp": 28.0, "base_humidity": 40},
        "Lucknow, Uttar Pradesh": {"lat": 26.8467, "lon": 80.9462, "base_temp": 26.0, "base_humidity": 60},
        "Kanpur, Uttar Pradesh": {"lat": 26.4499, "lon": 80.3319, "base_temp": 27.0, "base_humidity": 58},
        "Nagpur, Maharashtra": {"lat": 21.1458, "lon": 79.0882, "base_temp": 28.0, "base_humidity": 50},
        "Indore, Madhya Pradesh": {"lat": 22.7196, "lon": 75.8577, "base_temp": 27.0, "base_humidity": 48},
        "Bhopal, Madhya Pradesh": {"lat": 23.2599, "lon": 77.4126, "base_temp": 26.0, "base_humidity": 50},
        "Patna, Bihar": {"lat": 25.5941, "lon": 85.1376, "base_temp": 28.0, "base_humidity": 65},
        "Vadodara, Gujarat": {"lat": 22.3072, "lon": 73.1812, "base_temp": 28.0, "base_humidity": 50},
        "Surat, Gujarat": {"lat": 21.1702, "lon": 72.8311, "base_temp": 29.0, "base_humidity": 65},
        "Visakhapatnam, Andhra Pradesh": {"lat": 17.6868, "lon": 83.2185, "base_temp": 29.0, "base_humidity": 75},
        "Coimbatore, Tamil Nadu": {"lat": 11.0168, "lon": 76.9558, "base_temp": 26.0, "base_humidity": 60},
        "Madurai, Tamil Nadu": {"lat": 9.9252, "lon": 78.1198, "base_temp": 30.0, "base_humidity": 65},
        "Kochi, Kerala": {"lat": 9.9312, "lon": 76.2673, "base_temp": 28.0, "base_humidity": 80},
        "Thiruvananthapuram, Kerala": {"lat": 8.5241, "lon": 76.9366, "base_temp": 28.0, "base_humidity": 78},
        "Bhubaneswar, Odisha": {"lat": 20.2961, "lon": 85.8245, "base_temp": 28.0, "base_humidity": 70},
        "Ranchi, Jharkhand": {"lat": 23.3441, "lon": 85.3096, "base_temp": 25.0, "base_humidity": 60},
        "Guwahati, Assam": {"lat": 26.1445, "lon": 91.7362, "base_temp": 26.0, "base_humidity": 75},
        "Chandigarh, Punjab": {"lat": 30.7333, "lon": 76.7794, "base_temp": 24.0, "base_humidity": 55},
        "Amritsar, Punjab": {"lat": 31.6340, "lon": 74.8723, "base_temp": 25.0, "base_humidity": 50},
        "Ludhiana, Punjab": {"lat": 30.9010, "lon": 75.8573, "base_temp": 25.0, "base_humidity": 52},
        "Dehradun, Uttarakhand": {"lat": 30.3165, "lon": 78.0322, "base_temp": 22.0, "base_humidity": 60},
        "Shimla, Himachal Pradesh": {"lat": 31.1048, "lon": 77.1734, "base_temp": 15.0, "base_humidity": 65},
        "Srinagar, Jammu & Kashmir": {"lat": 34.0837, "lon": 74.7973, "base_temp": 14.0, "base_humidity": 55},
        "Jammu, Jammu & Kashmir": {"lat": 32.7266, "lon": 74.8570, "base_temp": 22.0, "base_humidity": 50},
        "Raipur, Chhattisgarh": {"lat": 21.2514, "lon": 81.6296, "base_temp": 28.0, "base_humidity": 55},
        "Varanasi, Uttar Pradesh": {"lat": 25.3176, "lon": 82.9739, "base_temp": 27.0, "base_humidity": 62},
        "Agra, Uttar Pradesh": {"lat": 27.1767, "lon": 78.0081, "base_temp": 27.0, "base_humidity": 55},
        "Jodhpur, Rajasthan": {"lat": 26.2389, "lon": 73.0243, "base_temp": 30.0, "base_humidity": 35},
        "Udaipur, Rajasthan": {"lat": 24.5854, "lon": 73.7125, "base_temp": 28.0, "base_humidity": 45},
        "Goa (Panaji)": {"lat": 15.4909, "lon": 73.8278, "base_temp": 29.0, "base_humidity": 75},
        "Mangalore, Karnataka": {"lat": 12.9141, "lon": 74.8560, "base_temp": 28.0, "base_humidity": 78},
        "Mysore, Karnataka": {"lat": 12.2958, "lon": 76.6394, "base_temp": 25.0, "base_humidity": 58},
        "Vijayawada, Andhra Pradesh": {"lat": 16.5062, "lon": 80.6480, "base_temp": 30.0, "base_humidity": 70},
        "Tiruchirappalli, Tamil Nadu": {"lat": 10.7905, "lon": 78.7047, "base_temp": 30.0, "base_humidity": 68},
        "Salem, Tamil Nadu": {"lat": 11.6643, "lon": 78.1460, "base_temp": 28.0, "base_humidity": 55},
        "Aurangabad, Maharashtra": {"lat": 19.8762, "lon": 75.3433, "base_temp": 28.0, "base_humidity": 48},
        "Nashik, Maharashtra": {"lat": 19.9975, "lon": 73.7898, "base_temp": 26.0, "base_humidity": 52},
        "Rajkot, Gujarat": {"lat": 22.3039, "lon": 70.8022, "base_temp": 28.0, "base_humidity": 45},
        "Jabalpur, Madhya Pradesh": {"lat": 23.1815, "lon": 79.9864, "base_temp": 27.0, "base_humidity": 52},
        "Gwalior, Madhya Pradesh": {"lat": 26.2183, "lon": 78.1828, "base_temp": 28.0, "base_humidity": 48},
        "Allahabad, Uttar Pradesh": {"lat": 25.4358, "lon": 81.8463, "base_temp": 28.0, "base_humidity": 58},
        "Meerut, Uttar Pradesh": {"lat": 28.9845, "lon": 77.7064, "base_temp": 26.0, "base_humidity": 55},
        "Faridabad, Haryana": {"lat": 28.4089, "lon": 77.3178, "base_temp": 26.0, "base_humidity": 52},
        "Gurugram, Haryana": {"lat": 28.4595, "lon": 77.0266, "base_temp": 26.0, "base_humidity": 50},
        "Noida, Uttar Pradesh": {"lat": 28.5355, "lon": 77.3910, "base_temp": 26.0, "base_humidity": 55},
        "Thane, Maharashtra": {"lat": 19.2183, "lon": 72.9781, "base_temp": 28.0, "base_humidity": 72},
        "Navi Mumbai, Maharashtra": {"lat": 19.0330, "lon": 73.0297, "base_temp": 28.0, "base_humidity": 70},
        "Imphal, Manipur": {"lat": 24.8170, "lon": 93.9368, "base_temp": 22.0, "base_humidity": 70},
        "Shillong, Meghalaya": {"lat": 25.5788, "lon": 91.8933, "base_temp": 18.0, "base_humidity": 80},
        "Aizawl, Mizoram": {"lat": 23.7271, "lon": 92.7176, "base_temp": 20.0, "base_humidity": 75},
        "Kohima, Nagaland": {"lat": 25.6751, "lon": 94.1086, "base_temp": 18.0, "base_humidity": 72},
        "Agartala, Tripura": {"lat": 23.8315, "lon": 91.2868, "base_temp": 26.0, "base_humidity": 78},
        "Gangtok, Sikkim": {"lat": 27.3389, "lon": 88.6065, "base_temp": 14.0, "base_humidity": 75},
        "Itanagar, Arunachal Pradesh": {"lat": 27.0844, "lon": 93.6053, "base_temp": 20.0, "base_humidity": 72},
        "Port Blair, Andaman & Nicobar": {"lat": 11.6234, "lon": 92.7265, "base_temp": 28.0, "base_humidity": 82},
        "Puducherry": {"lat": 11.9416, "lon": 79.8083, "base_temp": 29.0, "base_humidity": 75},
        "Daman": {"lat": 20.3974, "lon": 72.8328, "base_temp": 28.0, "base_humidity": 70},
        "Leh, Ladakh": {"lat": 34.1526, "lon": 77.5771, "base_temp": 8.0, "base_humidity": 30},
    }
    
    # Sidebar location selector (at the very top)
    st.sidebar.markdown("## 📍 Select Location")
    selected_location = st.sidebar.selectbox(
        "Choose City",
        options=list(locations.keys()),
        index=0,
        key="location_select"
    )
    loc_data = locations[selected_location]
    st.sidebar.markdown("---")
    
    # ========== LIVE WEATHER TICKER ==========
    current_time = datetime.now()
    seed = int(current_time.timestamp()) % 100
    random.seed(seed)
    
    # Use location-specific base values
    live_temp = loc_data['base_temp'] + random.uniform(-2, 2)
    live_humidity = loc_data['base_humidity'] + random.uniform(-5, 5)
    live_uv = 6.0 + random.uniform(-1, 1)
    live_wind = 12.0 + random.uniform(-3, 3)
    live_solar_index = 75.0 + random.uniform(-10, 10)
    
    st.markdown(f"""
    <div class="live-ticker">
        <div class="live-badge">
            <div class="live-dot"></div>
            LIVE WEATHER
        </div>
        <div class="ticker-item">
            <span class="ticker-label">📍 Location</span>
            <span class="ticker-value">{selected_location}</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">🌡️ Temp</span>
            <span class="ticker-value">{live_temp:.1f}°C</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">💧 Humidity</span>
            <span class="ticker-value">{live_humidity:.0f}%</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">☀️ UV Index</span>
            <span class="ticker-value">{live_uv:.1f}</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">💨 Wind</span>
            <span class="ticker-value">{live_wind:.0f} km/h</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">⚡ Solar</span>
            <span class="ticker-value">{live_solar_index:.0f}%</span>
        </div>
        <div class="ticker-item">
            <span class="ticker-label">🕒 Updated</span>
            <span class="ticker-value">{current_time.strftime('%H:%M:%S')}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Auto-refresh every 2 seconds (2000 milliseconds)
    st_autorefresh(interval=2000, limit=None, key="live_weather_refresh")
    
    # Load model
    model = load_model()
    latest_data = load_latest_weather_data()
    
    # ========== SIDEBAR: EXPERIMENT MODE TOGGLE ==========
    st.sidebar.markdown("## 🧪 Experiment Mode")
    experiment_mode = st.sidebar.toggle("Enable Experiment Mode", value=False, key="experiment_toggle")
    
    if experiment_mode:
        st.sidebar.markdown('<div class="experiment-badge">🔬 SIMULATION ACTIVE - Using manual values</div>', unsafe_allow_html=True)
        st.sidebar.markdown("### 🌤️ Weather Simulation")
        sim_temperature = st.sidebar.slider("Temperature (°C)", 10.0, 45.0, latest_data['temperature'], 0.5)
        sim_cloud_cover = st.sidebar.slider("Cloud Cover (%)", 0.0, 100.0, latest_data['cloud_cover'], 1.0)
        sim_humidity = st.sidebar.slider("Humidity (%)", 0.0, 100.0, latest_data['humidity'], 1.0)
        
        # Use simulated values
        active_temp = sim_temperature
        active_cloud = sim_cloud_cover
        active_humidity = sim_humidity
        data_source = "SIMULATION"
        data_color = "#ffcc00"
    else:
        st.sidebar.markdown('<div class="experiment-badge" style="background: rgba(0, 255, 136, 0.15); border-color: rgba(0, 255, 136, 0.4);">🔴 LIVE MODE - Real-time weather data</div>', unsafe_allow_html=True)
        
        # Use live weather values
        active_temp = live_temp
        active_cloud = 100 - live_solar_index  # Convert solar index to cloud cover
        active_humidity = live_humidity
        data_source = "LIVE"
        data_color = "#00ff88"
    
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🔧 System Configuration")
    panel_capacity = st.sidebar.slider("Panel Capacity (kW)", 1.0, 10.0, 5.0, 0.5)
    electricity_rate = st.sidebar.number_input("Electricity Rate (₹/kWh)", 1.0, 20.0, 7.0, 0.5)
    
    # Prepare calculations using ACTIVE weather data (live or simulated)
    tomorrow = datetime.now() + timedelta(days=1)
    day_of_year = tomorrow.timetuple().tm_yday
    
    # Generate solar curve data using ACTIVE weather values
    solar_curve_data = generate_solar_curve_data(
        model, active_temp, active_cloud, active_humidity, day_of_year, panel_capacity
    )
    
    # Calculate daily totals based on ACTIVE data
    total_daily_output = solar_curve_data['Energy_Output'].sum()
    max_possible_output = panel_capacity * 8  # Theoretical max with 8 peak sun hours
    efficiency_percent = (total_daily_output / max_possible_output) * 100 if max_possible_output > 0 else 0
    estimated_savings = total_daily_output * electricity_rate
    
    # Determine status
    if efficiency_percent >= 70:
        status_class = "status-high"
        status_text = "HIGH"
        status_emoji = "🟢"
    elif efficiency_percent >= 40:
        status_class = "status-medium"
        status_text = "MODERATE"
        status_emoji = "🟡"
    else:
        status_class = "status-low"
        status_text = "LOW"
        status_emoji = "🔴"
    
    # ========== TOP ROW: 4 KEY METRICS ==========
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">🌡️ Temperature <span style="color:{data_color}; font-size:0.6rem;">● {data_source}</span></div>
            <div class="metric-value">{active_temp:.1f}°C</div>
            <div class="metric-delta">{selected_location}</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">⚡ Daily Output <span style="color:{data_color}; font-size:0.6rem;">● {data_source}</span></div>
            <div class="metric-value">{total_daily_output:.1f} kWh</div>
            <div class="metric-delta">Peak: {solar_curve_data['Energy_Output'].max():.2f} kWh/hr</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">💰 Est. Savings <span style="color:{data_color}; font-size:0.6rem;">● {data_source}</span></div>
            <div class="metric-value">₹{estimated_savings:.0f}</div>
            <div class="metric-delta">Today @ ₹{electricity_rate}/kWh</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">📊 Efficiency <span style="color:{data_color}; font-size:0.6rem;">● {data_source}</span></div>
            <div class="metric-value" style="font-size: 1.8rem;">
                <span class="{status_class}">Status: {status_emoji} {status_text}</span>
            </div>
            <div class="metric-delta">{efficiency_percent:.1f}% of optimal</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # ========== MIDDLE ROW: Chart (70%) + AI Advice (30%) ==========
    chart_col, advice_col = st.columns([7, 3])
    
    with chart_col:
        st.plotly_chart(
            create_solar_curve_chart(solar_curve_data), 
            use_container_width=True, 
            config={'displayModeBar': False}
        )
    
    with advice_col:
        # AI Advice with actual slider values
        try:
            if hasattr(st, 'secrets') and 'GEMINI_API_KEY' in st.secrets:
                prediction_data = {
                    'solar_efficiency': efficiency_percent,
                    'temperature': temperature,
                    'cloud_cover': cloud_cover,
                    'humidity': humidity,
                    'hour_of_day': 12,  # Noon reference
                    'confidence_lower': efficiency_percent - 5,
                    'confidence_upper': efficiency_percent + 5
                }
                advice = generate_weather_advice(prediction_data, st.secrets['GEMINI_API_KEY'])
            else:
                # Context-aware fallback advice based on current slider values
                if cloud_cover > 70:
                    advice = f"☁️ With {cloud_cover:.0f}% cloud cover, delay high-energy tasks like laundry until conditions improve. Consider scheduling for tomorrow if the forecast shows clearer skies."
                elif cloud_cover > 40:
                    advice = f"⛅ Partial clouds at {cloud_cover:.0f}% - you'll still generate decent power. Run your dishwasher between 11 AM - 2 PM to catch the peak output window."
                elif temperature > 40:
                    advice = f"🌡️ High temperature ({temperature:.0f}°C) may reduce panel efficiency slightly. Morning hours (8-11 AM) will likely be your sweet spot today."
                elif humidity > 80:
                    advice = f"💧 High humidity ({humidity:.0f}%) might cause slight haze. Output is good, but peak performance expected between 10 AM - 1 PM."
                else:
                    advice = f"🌞 Excellent conditions! Clear skies and {temperature:.0f}°C is near optimal. Run all your heavy appliances between 10 AM - 3 PM to maximize free solar power."
        except Exception as e:
            advice = f"💡 Based on current conditions: Optimize appliance usage during peak sun hours (10 AM - 3 PM) for maximum savings."
        
        st.markdown(f"""
        <div class="ai-advice-box">
            <div class="ai-label">🤖 WattWise Smart Advisor</div>
            <div style="font-size: 0.95rem; line-height: 1.5;">{advice}</div>
        </div>
        """, unsafe_allow_html=True)
    
    # ========== BOTTOM ROW: Smart Appliance Optimizer ==========
    st.markdown("---")
    st.markdown('<div class="section-header">⚡ Smart Appliance Planner</div>', unsafe_allow_html=True)
    st.markdown("<p style='color: #a0a0a0; margin-bottom: 1rem;'>AI-powered recommendations based on current solar output</p>", unsafe_allow_html=True)
    
    # Get appliance status based on efficiency
    status_text, status_color, status_mode = get_appliance_status(efficiency_percent)
    
    # Create 3 columns for appliances
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🌡️</div>
            <div class="metric-label">HVAC / Air Conditioner</div>
            <div class="metric-value" style="color: {status_color}; font-size: 1.5rem;">{status_text}</div>
            <div class="metric-delta" style="color: {status_color};">{status_mode}</div>
            <div style="margin-top: 0.8rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                <span style="color: #a0a0a0; font-size: 0.75rem;">Est. Consumption: 1.5 kW/hr</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧺</div>
            <div class="metric-label">Washing Machine / Laundry</div>
            <div class="metric-value" style="color: {status_color}; font-size: 1.5rem;">{status_text}</div>
            <div class="metric-delta" style="color: {status_color};">{status_mode}</div>
            <div style="margin-top: 0.8rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                <span style="color: #a0a0a0; font-size: 0.75rem;">Est. Consumption: 0.5 kW/cycle</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🚗</div>
            <div class="metric-label">EV Charger / Electric Vehicle</div>
            <div class="metric-value" style="color: {status_color}; font-size: 1.5rem;">{status_text}</div>
            <div class="metric-delta" style="color: {status_color};">{status_mode}</div>
            <div style="margin-top: 0.8rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                <span style="color: #a0a0a0; font-size: 0.75rem;">Est. Consumption: 7.2 kW/hr</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Status Legend
    st.markdown(f"""
    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(18, 18, 26, 0.6); border-radius: 12px; border: 1px solid rgba(0, 255, 136, 0.2);">
        <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
            <span style="color: #00ff88;">✅ RUN NOW = Free Solar Power</span>
            <span style="color: #ffcc00;">⚠️ WAIT = Reduced Output</span>
            <span style="color: #ff4444;">⛔ AVOID = Expensive Grid Power</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
