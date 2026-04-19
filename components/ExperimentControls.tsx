interface ExperimentControlsProps {
    experimentMode: boolean;
    onExperimentModeChange: (value: boolean) => void;
    simTemp: number;
    onSimTempChange: (value: number) => void;
    simCloud: number;
    onSimCloudChange: (value: number) => void;
    simHumidity: number;
    onSimHumidityChange: (value: number) => void;
    panelCapacity: number;
    onPanelCapacityChange: (value: number) => void;
    electricityRate: number;
    onElectricityRateChange: (value: number) => void;
}

export default function ExperimentControls({
    experimentMode,
    onExperimentModeChange,
    simTemp,
    onSimTempChange,
    simCloud,
    onSimCloudChange,
    simHumidity,
    onSimHumidityChange,
    panelCapacity,
    onPanelCapacityChange,
    electricityRate,
    onElectricityRateChange,
}: ExperimentControlsProps) {
    return (
        <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Experiment Mode Toggle */}
                <div className="col-span-full flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                        <div className="text-white font-semibold mb-1">🧪 Experiment Mode</div>
                        <div className="text-text-secondary text-xs">
                            {experimentMode ? 'Using simulated values' : 'Using live weather data'}
                        </div>
                    </div>
                    <button
                        onClick={() => onExperimentModeChange(!experimentMode)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${experimentMode ? 'bg-neon-green/30' : 'bg-white/10'
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-neon-green transition-transform ${experimentMode ? 'translate-x-7' : ''
                                }`}
                        />
                    </button>
                </div>

                {/* Weather Simulation Controls */}
                {experimentMode && (
                    <>
                        <div>
                            <label className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider mb-2">
                                <span>🌡️ Temperature (°C)</span>
                                <span className="text-neon-green font-semibold">{simTemp.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="45"
                                step="0.5"
                                value={simTemp}
                                onChange={(e) => onSimTempChange(parseFloat(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider mb-2">
                                <span>☁️ Cloud Cover (%)</span>
                                <span className="text-neon-green font-semibold">{simCloud.toFixed(0)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={simCloud}
                                onChange={(e) => onSimCloudChange(parseFloat(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider mb-2">
                                <span>💧 Humidity (%)</span>
                                <span className="text-neon-green font-semibold">{simHumidity.toFixed(0)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={simHumidity}
                                onChange={(e) => onSimHumidityChange(parseFloat(e.target.value))}
                            />
                        </div>
                    </>
                )}

                {/* System Configuration */}
                <div className={experimentMode ? '' : 'col-span-full md:col-span-1'}>
                    <label className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider mb-2">
                        <span>⚡ Panel Capacity (kW)</span>
                        <span className="text-neon-green font-semibold">{panelCapacity.toFixed(1)}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={panelCapacity}
                        onChange={(e) => onPanelCapacityChange(parseFloat(e.target.value))}
                    />
                </div>

                <div className={experimentMode ? '' : 'col-span-full md:col-span-1'}>
                    <label className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider mb-2">
                        <span>💰 Electricity Rate (₹/kWh)</span>
                        <span className="text-neon-green font-semibold">{electricityRate.toFixed(1)}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={electricityRate}
                        onChange={(e) => onElectricityRateChange(parseFloat(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
