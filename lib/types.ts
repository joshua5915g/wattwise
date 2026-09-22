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

// ── 7-Day Forecast ───────────────────────────────────────────────
export interface ForecastDay {
    dayLabel: string;
    date: string;
    temp: number;
    cloudCover: number;
    solarIndex: number;
    predictedKwh: number;
    predictedSavings: number;
    weatherCondition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'hazy';
    conditionLabel: string;
    icon: string;
    peakHours: string;
}

// ── Smart Appliance Dispatcher ───────────────────────────────────
export interface Appliance {
    id: string;
    name: string;
    powerKw: number;
    durationHours: number;
    preferredTime: 'morning' | 'noon' | 'afternoon' | 'evening' | 'any';
    scheduledStartHour: number;
    icon: string;
    enabled: boolean;
}

export interface ApplianceOptimization {
    applianceId: string;
    name: string;
    suggestedStartHour: number;
    solarCoveredPercent: number;
    solarSavings: number;
    gridCost: number;
}

// ── Energy Flow Diagram ──────────────────────────────────────────
export interface EnergyFlowState {
    solarGenKw: number;
    homeLoadKw: number;
    batteryFlowKw: number; // positive = charging, negative = discharging
    batterySoc: number; // 0 - 100%
    gridFlowKw: number; // positive = export to grid, negative = import from grid
    selfSufficiencyPercent: number;
}

// ── Solar Financial & ROI ────────────────────────────────────────
export interface FinancialParams {
    systemCapacityKw: number;
    costPerWatt: number; // INR per Watt (e.g. 50-70 ₹/W)
    dailyGenerationKwh: number;
    electricityRate: number; // INR per kWh
    subsidyScheme: 'pm_surya_ghar' | 'commercial' | 'none';
    annualDegradation: number; // e.g. 0.7%
    annualTariffInflation: number; // e.g. 3%
}

export interface FinancialResult {
    grossCost: number;
    subsidyAmount: number;
    netCost: number;
    annualSavingsYear1: number;
    paybackYears: number;
    twentyFiveYearSavings: number;
    roiPercent: number;
    co2LifetimeTons: number;
}

// ── Rooftop Tilt & Shading ───────────────────────────────────────
export interface RoofGeometryConfig {
    tiltAngle: number; // 0 to 60 deg
    azimuth: 'south' | 'south-east' | 'south-west' | 'east' | 'west' | 'north';
    shadingObstruction: 'none' | 'partial_morning' | 'partial_afternoon' | 'heavy_trees' | 'high_rise';
    latitude: number;
}

export interface GeometryResult {
    optimalTilt: number;
    geometricEfficiencyPercent: number;
    shadingLossPercent: number;
    netEfficiencyFactor: number;
    adjustedAnnualYieldKwh: number;
    annualLossRevenue: number;
}

// ── AI Copilot (WattBot) ─────────────────────────────────────────
export interface ChatMessage {
    id: string;
    sender: 'user' | 'wattbot' | 'system';
    text: string;
    timestamp: string;
    quickSuggestions?: string[];
}

