'use client';

import React, { useState, useEffect } from 'react';
import type { PredictionResult } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface LiveEnergyFlowProps {
    prediction: PredictionResult | null;
    electricityRate: number;
    panelKw: number;
}

export default function LiveEnergyFlow({ prediction, electricityRate, panelKw }: LiveEnergyFlowProps) {
    const defaultSolar = prediction ? Math.max(0.2, +(prediction.peak_output * 0.85).toFixed(2)) : 2.5;

    const [liveSolar, setLiveSolar] = useState<number>(defaultSolar);
    const [liveHomeLoad, setLiveHomeLoad] = useState<number>(1.8);
    const [batterySoc, setBatterySoc] = useState<number>(75);
    const [isAutoSync, setIsAutoSync] = useState<boolean>(true);

    // Auto sync with prediction if active
    useEffect(() => {
        if (isAutoSync && prediction) {
            const nowHour = new Date().getHours();
            const currOutput = prediction.hourly_output[nowHour] ?? prediction.peak_output * 0.75;
            setLiveSolar(+currOutput.toFixed(2));
        }
    }, [isAutoSync, prediction]);

    // Energy balance calculations
    // Solar first powers Home Load
    const directSolarToHome = Math.min(liveSolar, liveHomeLoad);
    const remainingSolar = Math.max(0, liveSolar - liveHomeLoad);
    const deficitHomeLoad = Math.max(0, liveHomeLoad - liveSolar);

    // If surplus solar: charges battery up to 2.5kW max charge rate, rest goes to grid export
    const batteryChargeRate = Math.min(remainingSolar, 2.5);
    const gridExport = +(remainingSolar - batteryChargeRate).toFixed(2);

    // If deficit: battery discharges up to 2.5kW, rest is imported from grid
    const batteryDischargeRate = Math.min(deficitHomeLoad, 2.5);
    const gridImport = +(deficitHomeLoad - batteryDischargeRate).toFixed(2);

    const netGridFlow = gridExport > 0 ? gridExport : -gridImport;
    const netBatteryFlow = remainingSolar > 0 ? batteryChargeRate : -batteryDischargeRate;

    // Self sufficiency %
    const selfSufficiency = liveHomeLoad > 0
        ? Math.min(100, Math.round(((directSolarToHome + batteryDischargeRate) / liveHomeLoad) * 100))
        : 100;

    return (
        <div id="energy-flow" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>⚡</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Live Interactive Energy Flow & Micro-Grid
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Dynamic power dispatch matrix between Solar, Home, Battery Storage, and the Public Grid
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setIsAutoSync(!isAutoSync)}
                        className={`btn ${isAutoSync ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12 }}
                    >
                        {isAutoSync ? '🛰️ Auto-Synced (Live Solar)' : '🎛️ Manual Sandbox'}
                    </button>
                    <span className="badge badge-green">
                        <span className="live-dot" style={{ width: 5, height: 5 }} />
                        {selfSufficiency}% Self-Sufficient
                    </span>
                </div>
            </div>

            {/* Interactive SVG Flow Diagram */}
            <div style={{
                position: 'relative',
                background: 'radial-gradient(circle at center, rgba(59,130,246,0.06) 0%, rgba(9,9,15,0.95) 70%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '30px 20px',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <svg
                    viewBox="0 0 700 280"
                    style={{ width: '100%', maxWidth: 700, height: 'auto', overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#FCD34D" />
                        </linearGradient>
                        <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#60A5FA" />
                        </linearGradient>
                        <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="100%" stopColor="#4ADE80" />
                        </linearGradient>
                        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#A855F7" />
                            <stop offset="100%" stopColor="#C084FC" />
                        </linearGradient>
                    </defs>

                    {/* Flow Lines */}
                    {/* Solar -> Central Hub */}
                    <path
                        d="M 120 140 L 350 140"
                        stroke="#F59E0B"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        className={liveSolar > 0 ? 'flow-active' : ''}
                        opacity={liveSolar > 0 ? 0.9 : 0.2}
                    />

                    {/* Central Hub -> Home Load */}
                    <path
                        d="M 350 140 L 580 80"
                        stroke="#3B82F6"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        className="flow-active"
                        opacity={liveHomeLoad > 0 ? 0.9 : 0.2}
                    />

                    {/* Central Hub <-> Battery */}
                    <path
                        d="M 350 140 L 350 240"
                        stroke="#22C55E"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        className={netBatteryFlow > 0 ? 'flow-active' : netBatteryFlow < 0 ? 'flow-reverse' : ''}
                        opacity={Math.abs(netBatteryFlow) > 0 ? 0.9 : 0.2}
                    />

                    {/* Central Hub <-> Grid */}
                    <path
                        d="M 350 140 L 580 200"
                        stroke="#A855F7"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        className={netGridFlow > 0 ? 'flow-active' : netGridFlow < 0 ? 'flow-reverse' : ''}
                        opacity={Math.abs(netGridFlow) > 0 ? 0.9 : 0.2}
                    />

                    {/* Central Dispatch Hub Node */}
                    <circle cx="350" cy="140" r="16" fill="#1C1C28" stroke="#60A5FA" strokeWidth="2" className="float-glow" />
                    <text x="350" y="144" textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="bold">⚡</text>

                    {/* 1. Solar Node */}
                    <g transform="translate(60, 100)">
                        <rect width="120" height="80" rx="12" fill="#16161F" stroke="#F59E0B" strokeWidth="1.5" />
                        <text x="60" y="28" textAnchor="middle" fill="#FCD34D" fontSize="18">☀️</text>
                        <text x="60" y="46" textAnchor="middle" fill="#F1F1F3" fontSize="12" fontWeight="bold">Solar Array</text>
                        <text x="60" y="65" textAnchor="middle" fill="#FCD34D" fontSize="13" fontWeight="bold">{liveSolar.toFixed(2)} kW</text>
                    </g>

                    {/* 2. Home Load Node */}
                    <g transform="translate(520, 40)">
                        <rect width="120" height="80" rx="12" fill="#16161F" stroke="#3B82F6" strokeWidth="1.5" />
                        <text x="60" y="28" textAnchor="middle" fill="#60A5FA" fontSize="18">🏠</text>
                        <text x="60" y="46" textAnchor="middle" fill="#F1F1F3" fontSize="12" fontWeight="bold">Home Loads</text>
                        <text x="60" y="65" textAnchor="middle" fill="#60A5FA" fontSize="13" fontWeight="bold">{liveHomeLoad.toFixed(2)} kW</text>
                    </g>

                    {/* 3. Battery Node */}
                    <g transform="translate(290, 200)">
                        <rect width="120" height="75" rx="12" fill="#16161F" stroke="#22C55E" strokeWidth="1.5" />
                        <text x="60" y="24" textAnchor="middle" fill="#4ADE80" fontSize="16">🔋</text>
                        <text x="60" y="42" textAnchor="middle" fill="#F1F1F3" fontSize="12" fontWeight="bold">Battery ({batterySoc}%)</text>
                        <text x="60" y="60" textAnchor="middle" fill="#4ADE80" fontSize="12" fontWeight="bold">
                            {netBatteryFlow > 0 ? `+${netBatteryFlow.toFixed(2)} kW (Charging)` : netBatteryFlow < 0 ? `${netBatteryFlow.toFixed(2)} kW (Discharging)` : 'Idle'}
                        </text>
                    </g>

                    {/* 4. Grid Node */}
                    <g transform="translate(520, 160)">
                        <rect width="120" height="80" rx="12" fill="#16161F" stroke="#A855F7" strokeWidth="1.5" />
                        <text x="60" y="28" textAnchor="middle" fill="#C084FC" fontSize="18">🌐</text>
                        <text x="60" y="46" textAnchor="middle" fill="#F1F1F3" fontSize="12" fontWeight="bold">Grid Meter</text>
                        <text x="60" y="65" textAnchor="middle" fill={netGridFlow >= 0 ? '#4ADE80' : '#F87171'} fontSize="12" fontWeight="bold">
                            {netGridFlow > 0 ? `Export +${netGridFlow.toFixed(2)} kW` : netGridFlow < 0 ? `Import ${netGridFlow.toFixed(2)} kW` : 'Zero Grid (0 kW)'}
                        </text>
                    </g>
                </svg>
            </div>

            {/* Interactive Simulation Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>☀️ Solar Array Power:</span>
                        <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>{liveSolar.toFixed(2)} kW</span>
                    </div>
                    <input
                        type="range" min="0" max={panelKw * 1.2} step="0.1"
                        value={liveSolar}
                        disabled={isAutoSync}
                        onChange={e => setLiveSolar(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>🏠 Home Total Load:</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>{liveHomeLoad.toFixed(2)} kW</span>
                    </div>
                    <input
                        type="range" min="0.2" max="8.0" step="0.1"
                        value={liveHomeLoad}
                        onChange={e => setLiveHomeLoad(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>🔋 Battery State of Charge:</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-bright)' }}>{batterySoc}%</span>
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

            {/* Financial Velocity Summary */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--b2)',
                borderRadius: 'var(--r)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                    Net Metering Rate: <span style={{ color: 'var(--t1)', fontWeight: 600 }}>₹{electricityRate}/kWh</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                    Real-time Bill Velocity: <span style={{
                        color: netGridFlow >= 0 ? 'var(--green-bright)' : 'var(--red)',
                        fontWeight: 700
                    }}>
                        {netGridFlow >= 0 ? `Earning +₹${(netGridFlow * electricityRate).toFixed(1)}/hr` : `Cost -₹${(Math.abs(netGridFlow) * electricityRate).toFixed(1)}/hr`}
                    </span>
                </div>
            </div>
        </div>
    );
}
