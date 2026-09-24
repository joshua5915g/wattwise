'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

interface BifacialTrackerSimulatorProps {
    panelKw: number;
    rate: number;
    annualKwh: number;
}

type AlbedoSurface = 'white_roof' | 'concrete' | 'grass' | 'gravel';
type TrackingMode = 'fixed' | 'single_axis' | 'dual_axis';

interface SurfaceInfo {
    name: string;
    albedoFactor: number;
    bifacialGainPercent: number;
    icon: string;
}

const ALBEDO_SURFACES: Record<AlbedoSurface, SurfaceInfo> = {
    white_roof: { name: 'White High-Reflectance Coating', albedoFactor: 0.82, bifacialGainPercent: 22, icon: '⚪' },
    concrete: { name: 'Light Concrete Rooftop', albedoFactor: 0.35, bifacialGainPercent: 9, icon: '🏢' },
    grass: { name: 'Green Lawn & Ground Grass', albedoFactor: 0.20, bifacialGainPercent: 5, icon: '🌱' },
    gravel: { name: 'Dark Gravel / Tar Felt', albedoFactor: 0.12, bifacialGainPercent: 3, icon: '🪨' },
};

export default function BifacialTrackerSimulator({ panelKw, rate, annualKwh }: BifacialTrackerSimulatorProps) {
    const [isBifacial, setIsBifacial] = useState<boolean>(true);
    const [surface, setSurface] = useState<AlbedoSurface>('white_roof');
    const [trackingMode, setTrackingMode] = useState<TrackingMode>('single_axis');
    const [selectedHour, setSelectedHour] = useState<number>(12); // 6 to 18
    const [elevationHeightM, setElevationHeightM] = useState<number>(1.2); // 0.5 to 2.5m
    const [isWindStowed, setIsWindStowed] = useState<boolean>(false);

    const baseAnnual = annualKwh > 0 ? annualKwh : panelKw * 1550;
    const surfaceInfo = ALBEDO_SURFACES[surface];

    const calculations = useMemo(() => {
        // Height clearance multiplier for albedo diffusion
        const heightMultiplier = Math.min(1.25, 0.7 + (elevationHeightM * 0.25));

        // Tracker multipliers
        let trackerGainPercent = trackingMode === 'dual_axis' ? 35 : trackingMode === 'single_axis' ? 22 : 0;
        let bifacialGain = isBifacial ? Math.round(surfaceInfo.bifacialGainPercent * heightMultiplier) : 0;

        if (isWindStowed) {
            trackerGainPercent = 0;
        }

        const totalBoostPercent = trackerGainPercent + bifacialGain;
        const totalYieldKwh = Math.round(baseAnnual * (1 + totalBoostPercent / 100));
        const extraYieldKwh = totalYieldKwh - baseAnnual;
        const extraRevenueInr = Math.round(extraYieldKwh * rate);

        // CAPEX calculation for Tracker & Bifacial hardware delta
        const extraCapexInr = (isBifacial ? panelKw * 4000 : 0) + (trackingMode === 'dual_axis' ? panelKw * 18000 : trackingMode === 'single_axis' ? panelKw * 10000 : 0);
        const paybackDeltaYears = extraRevenueInr > 0 ? +(extraCapexInr / extraRevenueInr).toFixed(1) : 0;

        // Visual tilt angle based on time of day and tracking mode
        let currentTiltDeg = -15; // default fixed south
        if (isWindStowed) {
            currentTiltDeg = 0; // Flat stow
        } else if (trackingMode === 'dual_axis' || trackingMode === 'single_axis') {
            // Rotates from +45 deg (East at 6 AM) to -45 deg (West at 6 PM)
            currentTiltDeg = Math.round(45 - ((selectedHour - 6) / 12) * 90);
        }

        return {
            trackerGainPercent,
            bifacialGain,
            totalBoostPercent,
            totalYieldKwh,
            extraYieldKwh,
            extraRevenueInr,
            extraCapexInr,
            paybackDeltaYears,
            currentTiltDeg
        };
    }, [isBifacial, surfaceInfo, trackingMode, baseAnnual, rate, elevationHeightM, isWindStowed, selectedHour, panelKw]);

    return (
        <div id="tracker-simulator" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>☀️</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Bifacial Panels & Dual-Axis Solar Tracker Simulator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Simulate ground albedo reflectance, rear-side bifacial yield gain, and motorized sun tracking
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setIsWindStowed(!isWindStowed)}
                        className={`btn ${isWindStowed ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ fontSize: 12, background: isWindStowed ? '#EF4444' : undefined, color: isWindStowed ? '#fff' : undefined }}
                    >
                        {isWindStowed ? '🌪️ Storm Stow Active (0°)' : '🛡️ Storm Stow Mode'}
                    </button>
                    <button
                        onClick={() => setIsBifacial(!isBifacial)}
                        className={`btn ${isBifacial ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12 }}
                    >
                        {isBifacial ? '✨ Bifacial Glass Active' : 'Monofacial Standard'}
                    </button>
                    <span className="badge badge-amber">
                        +{calculations.totalBoostPercent}% Total Yield Boost
                    </span>
                </div>
            </div>

            {/* Visual Tracking & Albedo Reflection Simulation SVG */}
            <div style={{
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(15,15,23,0.95) 0%, rgba(22,22,31,0.95) 100%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 20px',
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 1fr) 300px',
                gap: 18,
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg viewBox="0 0 340 190" style={{ width: '100%', maxWidth: 320, overflow: 'visible' }}>
                        {/* Sun position adjusting to selected time of day */}
                        {(() => {
                            const sunX = 40 + ((selectedHour - 6) / 12) * 260;
                            const sunY = 150 - Math.sin(((selectedHour - 6) / 12) * Math.PI) * 110;
                            return (
                                <g>
                                    <circle cx={sunX} cy={sunY} r="16" fill="#F59E0B" className="float-glow" />
                                    {/* Direct rays */}
                                    <line x1={sunX} y1={sunY} x2="160" y2="115" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />
                                </g>
                            );
                        })()}

                        {/* Ground albedo reflected rays hitting rear side if bifacial */}
                        {isBifacial && !isWindStowed && (
                            <>
                                <line x1="100" y1="150" x2="145" y2="120" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3,3" className="flow-active" />
                                <line x1="220" y1="150" x2="175" y2="120" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3,3" className="flow-active" />
                            </>
                        )}

                        {/* Ground plane with surface color */}
                        <rect x="20" y="150" width="300" height="8" rx="2" fill={surface === 'white_roof' ? '#E2E8F0' : surface === 'grass' ? '#15803D' : surface === 'concrete' ? '#64748B' : '#334155'} />
                        <text x="30" y="172" fill="var(--t3)" fontSize="10">{surfaceInfo.name} (Albedo: {surfaceInfo.albedoFactor})</text>

                        {/* Tracker Stand with dynamic height */}
                        <line x1="160" y1="150" x2="160" y2={150 - (elevationHeightM * 30)} stroke="#94A3B8" strokeWidth="4" />
                        <circle cx="160" cy={150 - (elevationHeightM * 30)} r="5" fill="#3B82F6" />

                        {/* Tilted / Tracked Solar Panel */}
                        <g transform={`rotate(${calculations.currentTiltDeg}, 160, ${150 - (elevationHeightM * 30)})`}>
                            {/* Front side glass */}
                            <rect x="105" y={150 - (elevationHeightM * 30) - 4} width="110" height="8" rx="2" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
                            {/* Rear bifacial glass layer */}
                            {isBifacial && (
                                <rect x="105" y={150 - (elevationHeightM * 30) + 4} width="110" height="3" rx="1" fill="#93C5FD" opacity="0.85" />
                            )}
                        </g>
                    </svg>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Time: <strong style={{ color: 'var(--amber-bright)' }}>{selectedHour.toString().padStart(2, '0')}:00 hrs</strong> · Tilt: <strong style={{ color: 'var(--blue-bright)' }}>{calculations.currentTiltDeg}°</strong> · Albedo: <strong style={{ color: 'var(--green-bright)' }}>+{calculations.bifacialGain}%</strong>
                    </div>
                </div>

                {/* Energy Upside Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Total Annual Clean Yield</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                            {calculations.totalYieldKwh.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>kWh/yr</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                            +{calculations.extraYieldKwh} kWh extra generated
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Extra Annual Revenue</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 2 }}>
                            +{formatCurrency(calculations.extraRevenueInr)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                            CAPEX Payback: <strong style={{ color: 'var(--green-bright)' }}>{calculations.paybackDeltaYears} yrs</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Mode & Albedo Surface Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                {/* 1. Time Scrub Bar */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Sun Tracker Hour Scrubber:</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber-bright)' }}>
                            {selectedHour}:00
                        </span>
                    </div>
                    <input
                        type="range"
                        min="6"
                        max="18"
                        step="1"
                        value={selectedHour}
                        onChange={e => setSelectedHour(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--amber)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>06:00 (East)</span>
                        <span>12:00 (South)</span>
                        <span>18:00 (West)</span>
                    </div>
                </div>

                {/* 2. Tracking Mode Selector */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
                        Motorized Tracking Mode:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {[
                            { id: 'fixed', label: 'Fixed Tilt', boost: '+0%' },
                            { id: 'single_axis', label: '1-Axis Tracker', boost: '+22%' },
                            { id: 'dual_axis', label: '2-Axis Tracker', boost: '+35%' },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setTrackingMode(m.id as TrackingMode)}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: trackingMode === m.id ? 'var(--blue)' : 'var(--surface)',
                                    color: trackingMode === m.id ? '#fff' : 'var(--t2)',
                                    textAlign: 'center'
                                }}
                            >
                                <div>{m.label}</div>
                                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{m.boost}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Ground Albedo Reflectance Surface */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
                        Rooftop Albedo Surface:
                    </div>
                    <select
                        value={surface}
                        onChange={e => setSurface(e.target.value as AlbedoSurface)}
                        disabled={!isBifacial}
                        style={{
                            width: '100%',
                            background: 'var(--surface)',
                            border: '1px solid var(--b2)',
                            borderRadius: 6,
                            padding: '8px 10px',
                            color: 'var(--t1)',
                            fontSize: 12,
                            outline: 'none'
                        }}
                    >
                        {(Object.keys(ALBEDO_SURFACES) as AlbedoSurface[]).map(key => {
                            const s = ALBEDO_SURFACES[key];
                            return (
                                <option key={key} value={key}>
                                    {s.icon} {s.name} (+{s.bifacialGainPercent}% Rear Gain)
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 4. Ground Clearance Height */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Ground Clearance Height:</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue-bright)' }}>
                            {elevationHeightM} m
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={elevationHeightM}
                        onChange={e => setElevationHeightM(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--blue)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>0.5m (Flush)</span>
                        <span>1.5m (Optimal)</span>
                        <span>2.5m (High)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
