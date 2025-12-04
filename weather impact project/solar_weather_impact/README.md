# SolarAI - Intelligent Energy Forecasting Pipeline

**The Problem**
Renewable energy is unpredictable. Homeowners lose efficiency because they cannot anticipate solar output drops due to micro-weather patterns.

**The Solution**
A full-stack ML pipeline that predicts solar efficiency 24 hours in advance and uses an LLM Agent to provide actionable energy-saving advice.

**Tech Stack**
* **Core:** Python 3.10
* **ML:** XGBoost (Gradient Boosting for tabular data)
* **Data Engineering:** SQLite, OpenWeatherMap API (Automated ETL)
* **GenAI:** Google Gemini Flash (Context-aware recommendations)
* **Visualization:** Streamlit & PyDeck (Geospatial mapping)

**Key Features**
* ✅ Automated ETL pipeline with error handling and retries.
* ✅ Real-time inference with 95% confidence intervals.
* ✅ Geospatial heatmap of solar potential.

**How to Run**
1. Clone the repo.
2. `pip install -r requirements.txt`
3. Create a `.env` file with `OPENWEATHER_API_KEY` and `GEMINI_API_KEY`.
4. `streamlit run app.py`
