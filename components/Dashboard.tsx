'use client';

import { useState, useEffect } from 'react';
import { LOCATIONS, DEFAULT_LOCATION, DEFAULT_PANEL_CAPACITY, DEFAULT_ELECTRICITY_RATE, REFRESH_INTERVAL } from '@/lib/constants';
import { getPrediction, getAIAdvice, getWeatherData } from '@/lib/api';
import { getEfficiencyStatus, formatCurrency, getCurrentDayOfYear } from '@/lib/utils';
import type { PredictionResult, WeatherData, AIAdviceResult } from '@/lib/types';

import MetricCard from './MetricCard';
import SolarCurveChart from './SolarCurveChart';
import WeatherTicker from './WeatherTicker';
import AIAdvicePanel from './AIAdvicePanel';
import ExperimentControls from './ExperimentControls';
import LocationSelector from './LocationSelector';
import BatteryOptimization from './BatteryOptimization';

interface DashboardProps {
    initialExperimentMode?: boolean;
    showExperimentControls?: boolean;
    disableLiveWeather?: boolean;
}

export default function Dashboard({
    initialExperimentMode = false,
    showExperimentControls = false,
    disableLiveWeather = false,
}: DashboardProps) {
    // State
    const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
    const [experimentMode, setExperimentMode] = useState(initialExperimentMode);
    const [panelCapacity, setPanelCapacity] = useState(DEFAULT_PANEL_CAPACITY);
    const [electricityRate, setElectricityRate] = useState(DEFAULT_ELECTRICITY_RATE);

    // Weather states
    const [simTemp, setSimTemp] = useState(28.0);
    const [simCloud, setSimCloud] = useState(30.0);
    const [simHumidity, setSimHumidity] = useState(65.0);
    const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);

    // Prediction states
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState<AIAdviceResult | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch live weather data when live mode is enabled
    useEffect(() => {
        if (disableLiveWeather) {
            return;
        }

        const fetchWeather = async () => {
            try {
                const data = await getWeatherData(selectedLocation);
                setLiveWeather(data);
            } catch (error) {
                console.error('Failed to fetch weather:', error);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [selectedLocation, disableLiveWeather]);

    // Fetch predictions
    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                setLoading(true);

                // Determine active weather values
                const activeTemp = experimentMode ? simTemp : (liveWeather?.temperature || 28.0);
                const activeCloud = experimentMode ? simCloud : (liveWeather ? 100 - liveWeather.solar_index : 30.0);
                const activeHumidity = experimentMode ? simHumidity : (liveWeather?.humidity || 65.0);

                // Get prediction
                const predictionData = await getPrediction({
                    temperature: activeTemp,
                    cloud_cover: activeCloud,
                    humidity: activeHumidity,
                    panel_capacity: panelCapacity,
                    day_of_year: getCurrentDayOfYear(),
                });

                setPrediction(predictionData);

                // Get AI advice
                try {
                    const advice = await getAIAdvice({
                        solar_efficiency: predictionData.efficiency_percent,
                        temperature: activeTemp,
                        cloud_cover: activeCloud,
                        daily_output: predictionData.total_daily_output,
                    });
                    setAiAdvice(advice);
                } catch (error) {
                    console.error('AI advice failed:', error);
                }

            } catch (error) {
                console.error('Failed to fetch prediction:', error);
            } finally {
                setLoading(false);
            }
        };

        if (liveWeather || experimentMode) {
            fetchPrediction();
        }
    }, [liveWeather, experimentMode, simTemp, simCloud, simHumidity, panelCapacity]);

    // Derived values
    const activeTemp = experimentMode ? simTemp : (liveWeather?.temperature || 28.0);
    const activeCloud = experimentMode ? simCloud : (liveWeather ? 100 - liveWeather.solar_index : 30.0);
    const activeHumidity = experimentMode ? simHumidity : (liveWeather?.humidity || 65.0);
    const dataSource = experimentMode ? 'simulation' : 'live';
    const dataColor = experimentMode ? '#ffcc00' : '#00ff88';

    const estimatedSavings = prediction ? prediction.total_daily_output * electricityRate : 0;
    const efficiencyStatus = prediction ? getEfficiencyStatus(prediction.efficiency_percent) : null;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-2">
                    ⚡ Watt<span className="neon-text">Wise</span>
                </h1>
                <p className="text-text-secondary text-sm">
                    Intelligent Energy Forecasting & Cost Optimization
                </p>
            </div>

            {/* Location Selector */}
            <LocationSelector
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
            />

            {/* Live Weather Ticker */}
            {!disableLiveWeather && (
                <WeatherTicker weather={liveWeather} location={selectedLocation} />
            )}

            {/* Experiment Controls */}
            {showExperimentControls && (
                <ExperimentControls
                    experimentMode={experimentMode}
                    onExperimentModeChange={setExperimentMode}
                    simTemp={simTemp}
                    onSimTempChange={setSimTemp}
                    simCloud={simCloud}
                    onSimCloudChange={setSimCloud}
                    simHumidity={simHumidity}
                    onSimHumidityChange={setSimHumidity}
                    panelCapacity={panelCapacity}
                    onPanelCapacityChange={setPanelCapacity}
                    electricityRate={electricityRate}
                    onElectricityRateChange={setElectricityRate}
                />
            )}

            {/* Key Metrics */}
            {!loading && prediction && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        label={`🌡️ Temperature`}
                        value={`${activeTemp.toFixed(1)}°C`}
                        delta={selectedLocation}
                        status={dataSource}
                        color={dataColor}
                    />
                    <MetricCard
                        label={`⚡ Daily Output`}
                        value={`${prediction.total_daily_output.toFixed(1)} kWh`}
                        delta={`Peak: ${prediction.peak_output.toFixed(2)} kWh/hr`}
                        status={dataSource}
                        color={dataColor}
                    />
                    <MetricCard
                        label={`💰 Est. Savings`}
                        value={formatCurrency(estimatedSavings)}
                        delta={`Today @ ₹${electricityRate}/kWh`}
                        status={dataSource}
                        color={dataColor}
                    />
                    <MetricCard
                        label={`📊 Efficiency`}
                        value={efficiencyStatus ? `${efficiencyStatus.emoji} ${efficiencyStatus.text}` : 'Loading...'}
                        delta={`${prediction.efficiency_percent.toFixed(1)}% of optimal`}
                        status={dataSource}
                        color={dataColor}
                        statusClass={efficiencyStatus?.color}
                    />
                </div>
            )}

            {/* Chart and AI Advice */}
            {!loading && prediction && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
                        <SolarCurveChart prediction={prediction} />
                        <AIAdvicePanel advice={aiAdvice} />
                    </div>
                    <BatteryOptimization 
                        prediction={prediction} 
                        electricityRate={electricityRate} 
                    />
                </>
            )}

            {loading && (
                <div className="glass-card p-8 text-center">
                    <div className="animate-pulse">
                        <div className="neon-text text-2xl mb-2">⚡</div>
                        <p className="text-text-secondary">Loading predictions...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
