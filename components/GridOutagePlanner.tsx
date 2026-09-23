'use client';

import React, { useState, useMemo } from 'react';
import type { PredictionResult } from '@/lib/types';

interface GridOutagePlannerProps {
    prediction: PredictionResult | null;
    panelKw: number;
}

interface CriticalLoad {
    id: string;
    name: string;
    watts: number;
    icon: string;
    essential: boolean;
    enabled: boolean;
}

const DEFAULT_CRITICAL_LOADS: CriticalLoad[] = [
    { id: 'fridge', name: 'Refrigerator / Freezer', watts: 250, icon: '🧊', essential: true, enabled: true },
    { id: 'lights', name: 'Emergency LED Lighting', watts: 80, icon: '💡', essential: true, enabled: true },
    { id: 'wifi', name: 'Wi-Fi Router & Smart Hub', watts: 35, icon: '📶', essential: true, enabled: true },
    { id: 'fans', name: 'BLDC Ceiling Fans (x2)', watts: 110, icon: '🌀', essential: false, enabled: true },
    { id: 'medical', name: 'Medical CPAP / Oxygen Conc.', watts: 200, icon: '🫁', essential: false, enabled: false },
    { id: 'devices', name: 'Laptop & Phone Fast Chargers', watts: 140, icon: '📱', essential: false, enabled: true },
    { id: 'cooktop', name: 'Emergency Single Induction Burner', watts: 800, icon: '🍳', essential: false, enabled: false }
];

export default function GridOutagePlanner({ prediction, panelKw }: GridOutagePlannerProps) {
    const [batteryKwh, setBatteryKwh] = useState<number>(5.0); // 5kWh LiFePO4 battery pack
    const [batterySoc, setBatterySoc] = useState<number>(85); // 85% current SoC
    const [isBlackoutActive, setIsBlackoutActive] = useState<boolean>(false);
    const [stormMode, setStormMode] = useState<boolean>(false);
    const [loads, setLoads] = useState<CriticalLoad[]>(DEFAULT_CRITICAL_LOADS);

    const toggleLoad = (id: string) => {
        setLoads(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
    };

    // Live solar generation contribution (kW)
    const currentSolarKw = prediction
        ? (prediction.hourly_output[new Date().getHours()] ?? prediction.peak_output * 0.7)
        : panelKw * 0.5;

    // Calculations
    const calculations = useMemo(() => {
        const totalActiveWatts = loads.filter(l => l.enabled).reduce((acc, l) => acc + l.watts, 0);
        const totalActiveKw = Math.max(0.05, totalActiveWatts / 1000);

        const usableBatteryKwh = batteryKwh * (batterySoc / 100) * 0.9; // 90% DoD
        const solarContributionKw = isBlackoutActive ? currentSolarKw * 0.85 : currentSolarKw;

        // Net hourly drain rate from battery
        const netBatteryDrainKw = Math.max(0, totalActiveKw - solarContributionKw);

        let backupHours = 0;
        if (netBatteryDrainKw <= 0) {
            // Solar exceeds load! Infinitely sustainable during sun hours
            backupHours = 24.0;
        } else {
            backupHours = +(usableBatteryKwh / netBatteryDrainKw).toFixed(1);
        }

        const isSolarSustained = totalActiveKw <= solarContributionKw;

        return {
            totalWatts: totalActiveWatts,
            totalKw: totalActiveKw,
            usableBatteryKwh,
            backupHours: Math.min(48, backupHours),
            isSolarSustained,
            solarSurplusKw: Math.max(0, solarContributionKw - totalActiveKw),
        };
    }, [loads, batteryKwh, batterySoc, currentSolarKw, isBlackoutActive]);

    const hours = Math.floor(calculations.backupHours);
    const mins = Math.round((calculations.backupHours - hours) * 60);

    return (
        <div id="outage-planner" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>⚡</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Grid Blackout & Emergency Resilience Planner
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Simulate utility grid power cuts and calculate off-grid runtime for essential household circuits
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            setStormMode(!stormMode);
                            if (!stormMode) setBatterySoc(100);
                        }}
                        className={`btn ${stormMode ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12 }}
                    >
                        {stormMode ? '⛈️ Storm Mode Active (100% Buffer)' : '🛡️ Enable Storm Mode'}
                    </button>
                    <button
                        onClick={() => setIsBlackoutActive(!isBlackoutActive)}
                        style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                            background: isBlackoutActive ? 'var(--red)' : 'var(--raised)',
                            color: isBlackoutActive ? '#fff' : 'var(--t2)',
                            boxShadow: isBlackoutActive ? '0 0 12px rgba(239,68,68,0.5)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isBlackoutActive ? '🚨 Blackout Active (Off-Grid)' : '🔌 Normal Grid Connected'}
                    </button>
                </div>
            </div>

            {/* Emergency Runtime Status Hero Display */}
            <div style={{
                background: isBlackoutActive
                    ? 'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, rgba(9,9,15,0.95) 70%)'
                    : 'radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, rgba(9,9,15,0.95) 70%)',
                border: isBlackoutActive ? '1px solid var(--red)' : '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 18,
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Off-Grid Survival Autonomy
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: calculations.backupHours >= 12 ? 'var(--green-bright)' : calculations.backupHours >= 5 ? 'var(--amber-bright)' : 'var(--red)', marginTop: 4 }}>
                        {calculations.isSolarSustained ? '☀️ Infinite' : `${hours}h ${mins}m`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                        {calculations.isSolarSustained
                            ? `Solar (${currentSolarKw.toFixed(1)} kW) fully powers active load (${calculations.totalWatts} W)`
                            : `Powered by ${calculations.usableBatteryKwh.toFixed(1)} kWh battery + live solar`}
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Active Critical Load</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                        {calculations.totalWatts} <span style={{ fontSize: 13, fontWeight: 500 }}>Watts</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                        {loads.filter(l => l.enabled).length} emergency circuits on
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Battery Buffer (SoC)</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                        {batterySoc}% <span style={{ fontSize: 13, fontWeight: 500 }}>({batteryKwh} kWh)</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                        {stormMode ? '⚡ Storm Protection Active' : 'Normal Standby'}
                    </div>
                </div>
            </div>

            {/* Battery & Outage Simulation Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Battery Pack Capacity:</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-bright)' }}>{batteryKwh} kWh</span>
                    </div>
                    <input
                        type="range" min="2" max="20" step="1"
                        value={batteryKwh}
                        onChange={e => setBatteryKwh(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Current State of Charge (SoC):</span>
                        <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>{batterySoc}%</span>
                    </div>
                    <input
                        type="range" min="10" max="100" step="5"
                        value={batterySoc}
                        onChange={e => setBatterySoc(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Critical Emergency Circuits Selector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {loads.map(load => (
                    <div
                        key={load.id}
                        onClick={() => toggleLoad(load.id)}
                        style={{
                            background: load.enabled ? 'var(--raised)' : 'var(--surface)',
                            border: load.enabled ? '1px solid var(--blue)' : '1px solid var(--b1)',
                            borderRadius: 'var(--r)',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            opacity: load.enabled ? 1 : 0.5,
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{load.icon}</span>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{load.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{load.watts} W · {load.essential ? 'Essential' : 'Optional'}</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={load.enabled}
                            onChange={() => {}} // Handled by parent div
                            style={{ accentColor: 'var(--blue)', width: 16, height: 16, cursor: 'pointer' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
