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

    const baseAnnual = annualKwh > 0 ? annualKwh : panelKw * 1550;

    const surfaceInfo = ALBEDO_SURFACES[surface];

    const calculations = useMemo(() => {
        // Tracker multipliers
        const trackerGainPercent = trackingMode === 'dual_axis' ? 35 : trackingMode === 'single_axis' ? 22 : 0;
        const bifacialGain = isBifacial ? surfaceInfo.bifacialGainPercent : 0;

        const totalBoostPercent = trackerGainPercent + bifacialGain;
        const totalYieldKwh = Math.round(baseAnnual * (1 + totalBoostPercent / 100));
        const extraYieldKwh = totalYieldKwh - baseAnnual;
        const extraRevenueInr = Math.round(extraYieldKwh * rate);

        return {
            trackerGainPercent,
            bifacialGain,
            totalBoostPercent,
            totalYieldKwh,
            extraYieldKwh,
            extraRevenueInr,
        };
    }, [isBifacial, surfaceInfo, trackingMode, baseAnnual, rate]);

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
                    <svg viewBox="0 0 320 180" style={{ width: '100%', maxWidth: 300, overflow: 'visible' }}>
                        {/* Sun position adjusting to tracking mode */}
                        <circle cx={trackingMode === 'dual_axis' ? "230" : "190"} cy="35" r="18" fill="#F59E0B" className="float-glow" />

                        {/* Direct sun rays hitting front side */}
                        <line x1="210" y1="50" x2="160" y2="105" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />
                        <line x1="230" y1="55" x2="180" y2="110" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />

                        {/* Ground albedo reflected rays hitting rear side if bifacial */}
                        {isBifacial && (
                            <>
                                <line x1="100" y1="150" x2="135" y2="120" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3,3" className="flow-active" />
                                <line x1="140" y1="150" x2="155" y2="125" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3,3" className="flow-active" />
                            </>
                        )}

                        {/* Ground plane with surface color */}
                        <rect x="20" y="150" width="280" height="8" rx="2" fill={surface === 'white_roof' ? '#E2E8F0' : surface === 'grass' ? '#15803D' : surface === 'concrete' ? '#64748B' : '#334155'} />
                        <text x="30" y="170" fill="var(--t3)" fontSize="10">{surfaceInfo.name} (Albedo: {surfaceInfo.albedoFactor})</text>

                        {/* Tracker Stand */}
                        <line x1="150" y1="150" x2="150" y2="115" stroke="#94A3B8" strokeWidth="4" />
                        <circle cx="150" cy="115" r="5" fill="#3B82F6" />

                        {/* Tilted / Tracked Solar Panel */}
                        <g transform={`rotate(${trackingMode === 'dual_axis' ? -35 : trackingMode === 'single_axis' ? -22 : -15}, 150, 115)`}>
                            {/* Front side glass */}
                            <rect x="95" y="110" width="110" height="8" rx="2" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
                            {/* Rear bifacial glass layer */}
                            {isBifacial && (
                                <rect x="95" y="117" width="110" height="3" rx="1" fill="#93C5FD" opacity="0.8" />
                            )}
                        </g>
                    </svg>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Tracking: <span style={{ color: 'var(--amber-bright)', fontWeight: 700, textTransform: 'capitalize' }}>{trackingMode.replace('_', ' ')}</span> · Rear Albedo: <span style={{ color: 'var(--blue-bright)', fontWeight: 700 }}>+{calculations.bifacialGain}%</span>
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
                            Pure net metering & bill savings upside
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Mode & Albedo Surface Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {/* 1. Tracking Mode Selector */}
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

                {/* 2. Ground Albedo Reflectance Surface */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
                        Rooftop Albedo Surface (Rear Bifacial Gain):
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
            </div>
        </div>
    );
}
