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

interface SliderRowProps {
    icon: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    color?: string;
    onChange: (v: number) => void;
}

function SliderRow({ icon, label, value, min, max, step, unit, color = '#f59e0b', onChange }: SliderRowProps) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                    </span>
                </div>
                <span className="text-sm font-bold font-display" style={{ color }}>
                    {value.toFixed(step < 1 ? 1 : 0)}{unit}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    style={{
                        background: `linear-gradient(90deg, ${color}60 ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
}

export default function ExperimentControls({
    experimentMode,
    onExperimentModeChange,
    simTemp, onSimTempChange,
    simCloud, onSimCloudChange,
    simHumidity, onSimHumidityChange,
    panelCapacity, onPanelCapacityChange,
    electricityRate, onElectricityRateChange,
}: ExperimentControlsProps) {
    return (
        <div className="glass-card p-6 relative overflow-hidden">
            <div
                className="metric-card-accent"
                style={{
                    background: experimentMode
                        ? 'linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.2), transparent)'
                        : 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)',
                }}
            />
            <div className="absolute right-4 bottom-3 text-7xl opacity-[0.04] pointer-events-none select-none">🧪</div>

            {/* Header + toggle */}
            <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{
                            background: experimentMode
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${experimentMode ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        🧪
                    </div>
                    <div>
                        <div className="font-display font-semibold text-white text-sm">Experiment Mode</div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {experimentMode
                                ? 'Simulating custom weather conditions'
                                : 'Using real-time live weather data'}
                        </div>
                    </div>
                </div>

                {/* Toggle switch */}
                <button
                    onClick={() => onExperimentModeChange(!experimentMode)}
                    className="relative flex-shrink-0"
                    style={{ width: 52, height: 28 }}
                    aria-label="Toggle experiment mode"
                >
                    <div
                        className="absolute inset-0 rounded-full transition-all duration-300"
                        style={{
                            background: experimentMode
                                ? 'rgba(245,158,11,0.25)'
                                : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${experimentMode ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: experimentMode ? '0 0 12px rgba(245,158,11,0.3)' : 'none',
                        }}
                    />
                    <div
                        className="absolute top-1 rounded-full transition-all duration-300"
                        style={{
                            width: 20,
                            height: 20,
                            left: experimentMode ? 28 : 4,
                            background: experimentMode ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                            boxShadow: experimentMode ? '0 0 10px rgba(245,158,11,0.7)' : 'none',
                        }}
                    />
                </button>
            </div>

            {/* Sliders grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                {/* Sim-only sliders */}
                {experimentMode && (
                    <>
                        <SliderRow
                            icon="🌡️" label="Temperature" unit="°C"
                            value={simTemp} min={10} max={45} step={0.5}
                            color="#f97316"
                            onChange={onSimTempChange}
                        />
                        <SliderRow
                            icon="☁️" label="Cloud Cover" unit="%"
                            value={simCloud} min={0} max={100} step={1}
                            color="#7070c0"
                            onChange={onSimCloudChange}
                        />
                        <SliderRow
                            icon="💧" label="Humidity" unit="%"
                            value={simHumidity} min={0} max={100} step={1}
                            color="#06b6d4"
                            onChange={onSimHumidityChange}
                        />
                    </>
                )}

                {/* Always-visible sliders */}
                <SliderRow
                    icon="⚡" label="Panel Capacity" unit=" kW"
                    value={panelCapacity} min={1} max={10} step={0.5}
                    color="#f59e0b"
                    onChange={onPanelCapacityChange}
                />
                <SliderRow
                    icon="💰" label="Electricity Rate" unit=" ₹/kWh"
                    value={electricityRate} min={1} max={20} step={0.5}
                    color="#10b981"
                    onChange={onElectricityRateChange}
                />
            </div>
        </div>
    );
}
