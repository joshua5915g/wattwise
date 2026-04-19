// TypeScript interfaces and types for the application

export interface PredictionParams {
    temperature: number;
    cloud_cover: number;
    humidity: number;
    panel_capacity: number;
    day_of_year: number;
}

export interface PredictionResult {
    hourly_output: number[];
    total_daily_output: number;
    peak_hour: number;
    peak_output: number;
    efficiency_percent: number;
}

export interface WeatherData {
    location: string;
    temperature: number;
    humidity: number;
    uv_index: number;
    wind_speed: number;
    solar_index: number;
    timestamp: string;
}

export interface AIAdviceParams {
    solar_efficiency: number;
    temperature: number;
    cloud_cover: number;
    daily_output: number;
}

export interface AIAdviceResult {
    advice: string;
    appliance_recommendations?: string[];
    optimal_hours?: string;
}

export interface LocationData {
    lat: number;
    lon: number;
    base_temp: number;
    base_humidity: number;
}

export type LocationMap = Record<string, LocationData>;

export interface HourlyData {
    hour: number;
    hour_label: string;
    energy_output: number;
}

export type EfficiencyStatus = 'high' | 'medium' | 'low';

export type DataSource = 'live' | 'simulation';
