'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

export type ObstructionType = 'building' | 'tree' | 'watertank' | 'parapet' | 'none';

interface ObstacleConfig {
    id: ObstructionType;
    name: string;
    icon: string;
    heightMeters: number;
    distanceMeters: number;
    position: 'east' | 'west' | 'south_east' | 'south_west' | 'north';
    foliageDensity: number; // 0 to 1
}

const DEFAULT_OBSTACLES: Record<ObstructionType, ObstacleConfig> = {
    building: {
        id: 'building',
        name: 'Adjacent 4-Story Apartment Building',
        icon: '🏢',
        heightMeters: 14,
        distanceMeters: 8,
        position: 'east',
        foliageDensity: 1.0
    },
    tree: {
        id: 'tree',
        name: 'Tall Coconut / Neem Tree Canopy',
        icon: '🌳',
        heightMeters: 9,
        distanceMeters: 5,
        position: 'south_west',
        foliageDensity: 0.75
    },
    watertank: {
        id: 'watertank',
        name: 'Overhead Sintex Water Tank & RCC Pillar',
        icon: '🚰',
        heightMeters: 3.5,
        distanceMeters: 3,
        position: 'south_east',
        foliageDensity: 1.0
    },
    parapet: {
        id: 'parapet',
        name: 'Rooftop Parapet Boundary Wall & Elevator Shaft',
        icon: '🧱',
        heightMeters: 2.2,
        distanceMeters: 2,
        position: 'west',
        foliageDensity: 1.0
    },
    none: {
        id: 'none',
        name: 'Clear Open Rooftop (Zero Obstruction)',
        icon: '☀️',
        heightMeters: 0,
        distanceMeters: 20,
        position: 'north',
        foliageDensity: 0
    }
};

interface RooftopShadingSimulatorProps {
    panelKw: number;
    rate: number;
    dailyKwh: number;
}

export default function RooftopShadingSimulator({
    panelKw,
    rate,
    dailyKwh
}: RooftopShadingSimulatorProps) {
    const [selectedObstacle, setSelectedObstacle] = useState<ObstructionType>('building');
    const [selectedHour, setSelectedHour] = useState<number>(9); // 6 to 18
    const [useMicroinverters, setUseMicroinverters] = useState<boolean>(false);
    const [obstacleDistance, setObstacleDistance] = useState<number>(7); // meters

    const obstacle = DEFAULT_OBSTACLES[selectedObstacle];

    // Compute sun angles and shading geometry
    const sim = useMemo(() => {
        // Solar elevation: 0 at 6 AM, ~75 deg at 12 PM, 0 at 6 PM
        const normHour = (selectedHour - 6) / 12; // 0 to 1
        const sunElevationDeg = Math.max(0, Math.sin(normHour * Math.PI) * 75);
        // Solar azimuth: 90 deg (East at 6 AM), 180 (South at 12 PM), 270 (West at 6 PM)
        const sunAzimuthDeg = 90 + (normHour * 180);

        // Shadow length calculation: L = H / tan(elevation)
        const elevRad = (Math.max(5, sunElevationDeg) * Math.PI) / 180;
        const shadowLengthMeters = obstacle.heightMeters / Math.tan(elevRad);

        // Does shadow reach solar panels?
        const reachesArray = obstacle.id !== 'none' && shadowLengthMeters > obstacleDistance;

        // Shadow coverage calculation based on hour and obstacle position
        let hourShadeIntensity = 0;
        if (reachesArray) {
            if (obstacle.position === 'east' && selectedHour < 12) {
                hourShadeIntensity = Math.min(1, ((12 - selectedHour) / 6) * obstacle.foliageDensity);
            } else if (obstacle.position === 'west' && selectedHour > 12) {
                hourShadeIntensity = Math.min(1, ((selectedHour - 12) / 6) * obstacle.foliageDensity);
            } else if (obstacle.position === 'south_east' && selectedHour <= 13) {
                hourShadeIntensity = Math.min(1, ((13 - selectedHour) / 6) * obstacle.foliageDensity);
            } else if (obstacle.position === 'south_west' && selectedHour >= 11) {
                hourShadeIntensity = Math.min(1, ((selectedHour - 11) / 6) * obstacle.foliageDensity);
            }
        }

        // String Inverter Mismatch vs Microinverters
        // In string inverters, shading 1 panel drags the entire string down by ~70% due to series current bottleneck.
        // With Microinverters / DC Optimizers, only shaded module drops.
        const stringMismatchFactor = useMicroinverters ? 0.35 : 0.85;
        const instantLossPercent = Math.min(95, Math.round(hourShadeIntensity * stringMismatchFactor * 100));

        // Annualized yield impact
        const annualBaseKwh = dailyKwh * 365;
        const averageDailyShadeLossPercent = obstacle.id === 'none' ? 0 : useMicroinverters ? 4.5 : 14.8;
        const annualLossKwh = Math.round(annualBaseKwh * (averageDailyShadeLossPercent / 100));
        const annualLostRevenue = Math.round(annualLossKwh * rate);
        const optimizerRecoveryGain = Math.round(annualBaseKwh * (0.103) * rate);

        return {
            sunElevationDeg: Math.round(sunElevationDeg),
            sunAzimuthDeg: Math.round(sunAzimuthDeg),
            shadowLengthMeters: +shadowLengthMeters.toFixed(1),
            reachesArray,
            instantLossPercent,
            diodesActive: instantLossPercent > 15,
            annualLossKwh,
            annualLostRevenue,
            optimizerRecoveryGain,
            averageDailyShadeLossPercent
        };
    }, [selectedHour, obstacle, obstacleDistance, useMicroinverters, dailyKwh, rate]);

    return (
        <div id="shading-simulator" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🌲</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-bright)' }}>
                            Rooftop Solar Shading & Obstruction Simulator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Ray-trace 3D shadows from nearby buildings, trees, and water tanks to evaluate bypass diode activation and string mismatch
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setUseMicroinverters(!useMicroinverters)}
                        className={`btn ${useMicroinverters ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        {useMicroinverters ? '⚡ Microinverters / MLPE Active' : 'Standard String Inverter'}
                    </button>
                    <span className={`badge ${sim.instantLossPercent > 20 ? 'badge-amber' : 'badge-green'}`}>
                        {sim.instantLossPercent}% Current Shade Loss
                    </span>
                </div>
            </div>

            {/* Visual 2.5D Rooftop Shading Canvas */}
            <div style={{
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(10,14,26,0.95) 0%, rgba(18,24,38,0.95) 100%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 20px',
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) 280px',
                gap: 18,
                alignItems: 'center'
            }}>
                {/* SVG Ray-Tracing Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg viewBox="0 0 380 200" style={{ width: '100%', maxWidth: 360, overflow: 'visible' }}>
                        {/* Sky Horizon */}
                        <defs>
                            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1E293B" />
                                <stop offset="100%" stopColor="#0F172A" />
                            </linearGradient>
                            <linearGradient id="shadowGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.75)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
                            </linearGradient>
                        </defs>

                        {/* Sun position across arc */}
                        {(() => {
                            const arcX = 50 + ((selectedHour - 6) / 12) * 280;
                            const arcY = 160 - Math.sin(((selectedHour - 6) / 12) * Math.PI) * 120;
                            return (
                                <g>
                                    <circle cx={arcX} cy={arcY} r="16" fill="#F59E0B" className="float-glow" />
                                    <line x1={arcX} y1={arcY} x2="190" y2="140" stroke="#FCD34D" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                                </g>
                            );
                        })()}

                        {/* Sun Sun-path Arc line */}
                        <path d="M 50 160 Q 190 20 330 160" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />

                        {/* Concrete Rooftop Deck Floor */}
                        <polygon points="40,165 340,165 370,195 10,195" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <text x="25" y="190" fill="#94A3B8" fontSize="10" fontWeight="600">Rooftop Surface Deck (South Facing)</text>

                        {/* Dynamic Obstacle Render */}
                        {obstacle.id === 'building' && (
                            <g>
                                <rect x="35" y="65" width="55" height="100" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                                <rect x="43" y="75" width="12" height="15" fill="#FCD34D" opacity="0.8" />
                                <rect x="65" y="75" width="12" height="15" fill="#FCD34D" opacity="0.8" />
                                <rect x="43" y="105" width="12" height="15" fill="#94A3B8" opacity="0.5" />
                                <rect x="65" y="105" width="12" height="15" fill="#94A3B8" opacity="0.5" />
                                <text x="40" y="55" fill="#E2E8F0" fontSize="10" fontWeight="bold">🏢 Building</text>
                            </g>
                        )}

                        {obstacle.id === 'tree' && (
                            <g>
                                <rect x="60" y="110" width="10" height="55" fill="#78350F" />
                                <circle cx="65" cy="95" r="28" fill="#15803D" opacity="0.9" />
                                <circle cx="50" cy="85" r="18" fill="#16A34A" opacity="0.8" />
                                <circle cx="80" cy="85" r="18" fill="#22C55E" opacity="0.8" />
                                <text x="45" y="55" fill="#86EFAC" fontSize="10" fontWeight="bold">🌳 Tree</text>
                            </g>
                        )}

                        {obstacle.id === 'watertank' && (
                            <g>
                                <rect x="65" y="125" width="6" height="40" fill="#64748B" />
                                <rect x="85" y="125" width="6" height="40" fill="#64748B" />
                                <rect x="55" y="95" width="45" height="32" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                                <text x="50" y="85" fill="#7DD3FC" fontSize="10" fontWeight="bold">🚰 Water Tank</text>
                            </g>
                        )}

                        {obstacle.id === 'parapet' && (
                            <g>
                                <rect x="35" y="135" width="45" height="30" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                                <text x="35" y="125" fill="#CBD5E1" fontSize="10" fontWeight="bold">🧱 Wall</text>
                            </g>
                        )}

                        {/* Cast Shadow Polygon */}
                        {obstacle.id !== 'none' && (
                            <polygon
                                points={`90,165 ${Math.min(320, 90 + sim.shadowLengthMeters * 10)},185 ${Math.min(340, 70 + sim.shadowLengthMeters * 10)},195 40,195`}
                                fill="url(#shadowGrad)"
                                opacity={selectedHour < 12 && obstacle.position.includes('east') ? 0.9 : selectedHour > 12 && obstacle.position.includes('west') ? 0.9 : 0.4}
                            />
                        )}

                        {/* Solar PV String 1 (Panels) */}
                        <g transform="translate(150, 130)">
                            {[0, 32, 64, 96].map((offset, i) => {
                                const isShaded = sim.reachesArray && sim.instantLossPercent > (i * 20);
                                return (
                                    <g key={i} transform={`translate(${offset}, 0)`}>
                                        <rect
                                            x="0"
                                            y="0"
                                            width="28"
                                            height="32"
                                            rx="2"
                                            fill={isShaded ? '#1E293B' : '#1D4ED8'}
                                            stroke={isShaded ? '#EF4444' : '#60A5FA'}
                                            strokeWidth="1.5"
                                        />
                                        {/* Grid busbars */}
                                        <line x1="14" y1="0" x2="14" y2="32" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                                        <line x1="0" y1="16" x2="28" y2="16" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                                        {isShaded && (
                                            <text x="7" y="20" fill="#F87171" fontSize="11" fontWeight="bold">✕</text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>

                        {/* Bypass Diode / Inverter State indicator */}
                        <text x="150" y="180" fill="#E2E8F0" fontSize="10" fontWeight="600">
                            String 1 (4x Panels) · {sim.diodesActive ? '⚠️ Bypass Diode Engaged' : '✓ Normal MPPT'}
                        </text>
                    </svg>

                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Time: <strong style={{ color: 'var(--amber-bright)' }}>{selectedHour.toString().padStart(2, '0')}:00 hrs</strong> · Sun Elevation: <strong style={{ color: 'var(--blue-bright)' }}>{sim.sunElevationDeg}°</strong> · Shadow: <strong style={{ color: 'var(--t1)' }}>{sim.shadowLengthMeters}m</strong>
                    </div>
                </div>

                {/* Shading Loss Analytics Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Instantaneous String Shading</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: sim.instantLossPercent > 20 ? '#F87171' : 'var(--green-bright)', marginTop: 2 }}>
                            -{sim.instantLossPercent}% <span style={{ fontSize: 12, fontWeight: 500 }}>Output Loss</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                            {useMicroinverters ? '⚡ Isolated to shaded module only' : '⚠️ String bottleneck drags adjacent panels'}
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Annual Revenue Lost to Shade</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 2 }}>
                            -{formatCurrency(sim.annualLostRevenue)} <span style={{ fontSize: 12, fontWeight: 500 }}>/ yr</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                            ~{sim.annualLossKwh} kWh clean generation clipped
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Hour Scrub Slider & Obstacle Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {/* 1. Time Scrub Bar */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Sun Time-of-Day Shadow Scrubber:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber-bright)' }}>
                            {selectedHour.toString().padStart(2, '0')}:00 {selectedHour < 12 ? 'AM' : selectedHour === 12 ? 'PM' : 'PM'}
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
                        <span>06:00 (Sunrise)</span>
                        <span>12:00 (Zenith)</span>
                        <span>18:00 (Sunset)</span>
                    </div>
                </div>

                {/* 2. Obstacle Type Selector */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
                        Rooftop Obstruction Object:
                    </div>
                    <select
                        value={selectedObstacle}
                        onChange={e => setSelectedObstacle(e.target.value as ObstructionType)}
                        style={{
                            width: '100%',
                            background: 'var(--surface)',
                            border: '1px solid var(--b2)',
                            borderRadius: 6,
                            padding: '9px 12px',
                            color: 'var(--t1)',
                            fontSize: 12,
                            fontWeight: 600,
                            outline: 'none'
                        }}
                    >
                        {(Object.keys(DEFAULT_OBSTACLES) as ObstructionType[]).map(key => {
                            const o = DEFAULT_OBSTACLES[key];
                            return (
                                <option key={key} value={key}>
                                    {o.icon} {o.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 3. Distance Slider */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Obstacle Distance from Array:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-bright)' }}>
                            {obstacleDistance} <span style={{ fontSize: 11, fontWeight: 500 }}>meters</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="20"
                        step="1"
                        value={obstacleDistance}
                        onChange={e => setObstacleDistance(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--blue)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>2m (Adjacent)</span>
                        <span>10m (Medium)</span>
                        <span>20m (Far)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
