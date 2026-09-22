'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { GeometryResult } from '@/lib/types';

interface RoofGeometrySimulatorProps {
    panelKw: number;
    rate: number;
    annualKwh: number;
}

export default function RoofGeometrySimulator({ panelKw, rate, annualKwh }: RoofGeometrySimulatorProps) {
    const [tiltAngle, setTiltAngle] = useState<number>(20); // 20 deg optimal in India
    const [azimuth, setAzimuth] = useState<'south' | 'south-east' | 'south-west' | 'east' | 'west' | 'north'>('south');
    const [shading, setShading] = useState<'none' | 'partial_morning' | 'partial_afternoon' | 'heavy_trees' | 'high_rise'>('none');

    const optimalTilt = 20; // Average latitude-based tilt for central India

    const results = useMemo<GeometryResult>(() => {
        // Tilt loss formula: cos(tilt - optimalTilt)
        const tiltRad = ((tiltAngle - optimalTilt) * Math.PI) / 180;
        const tiltEfficiency = Math.max(0.65, Math.cos(tiltRad));

        // Azimuth factors (South is 1.0 in Northern Hemisphere / India)
        const azimuthFactors = {
            'south': 1.0,
            'south-east': 0.94,
            'south-west': 0.94,
            'east': 0.82,
            'west': 0.82,
            'north': 0.55,
        };
        const azimuthFactor = azimuthFactors[azimuth] || 1.0;

        // Shading loss percentages
        const shadingLosses = {
            'none': 0,
            'partial_morning': 8,
            'partial_afternoon': 12,
            'heavy_trees': 22,
            'high_rise': 35,
        };
        const shadingLoss = shadingLosses[shading] || 0;

        const netFactor = +(tiltEfficiency * azimuthFactor * (1 - shadingLoss / 100)).toFixed(3);
        const baselineAnnual = annualKwh > 0 ? annualKwh : panelKw * 1550;
        const adjustedYield = +(baselineAnnual * netFactor).toFixed(0);
        const lossRevenue = Math.max(0, +((baselineAnnual - adjustedYield) * rate).toFixed(0));

        return {
            optimalTilt,
            geometricEfficiencyPercent: Math.round(tiltEfficiency * azimuthFactor * 100),
            shadingLossPercent: shadingLoss,
            netEfficiencyFactor: netFactor,
            adjustedAnnualYieldKwh: adjustedYield,
            annualLossRevenue: lossRevenue,
        };
    }, [tiltAngle, azimuth, shading, panelKw, rate, annualKwh]);

    return (
        <div id="geometry" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>📐</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Rooftop Tilt Angle, Azimuth & Shading 3D Simulator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Optimize panel inclination angle, compass heading, and simulate shadow losses
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-blue">Optimal Tilt: {optimalTilt}° South</span>
                    <span className="badge badge-green">{Math.round(results.netEfficiencyFactor * 100)}% Net Solar Capture</span>
                </div>
            </div>

            {/* Visual Solar Geometry Display */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(15,15,23,0.95) 0%, rgba(22,22,31,0.95) 100%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                alignItems: 'center'
            }}>
                {/* SVG Panel Tilt Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 320 200" style={{ width: '100%', maxWidth: 300, overflow: 'visible' }}>
                        {/* Sun in sky */}
                        <circle cx="240" cy="40" r="20" fill="#F59E0B" className="float-glow" />
                        {/* Sun rays pointing down to panel */}
                        <line x1="220" y1="55" x2="160" y2="110" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />
                        <line x1="240" y1="65" x2="190" y2="120" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" />

                        {/* Ground / Roof Line */}
                        <line x1="30" y1="160" x2="290" y2="160" stroke="var(--b2)" strokeWidth="3" strokeLinecap="round" />
                        <text x="40" y="180" fill="var(--t3)" fontSize="11">Horizontal Roof Plane (0°)</text>

                        {/* Stand / Mounting Rack */}
                        <line x1="100" y1="160" x2="100" y2="160" stroke="#60A5FA" strokeWidth="3" />

                        {/* Tilted Solar Panel */}
                        <g transform={`rotate(${-tiltAngle}, 100, 160)`}>
                            {/* Panel Blue Plane */}
                            <rect x="100" y="152" width="130" height="12" rx="3" fill="#3B82F6" stroke="#60A5FA" strokeWidth="2" />
                            {/* Photovoltaic grid cells */}
                            <line x1="130" y1="152" x2="130" y2="164" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                            <line x1="160" y1="152" x2="160" y2="164" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                            <line x1="190" y1="152" x2="190" y2="164" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        </g>

                        {/* Arc for angle */}
                        <path d="M 160 160 A 60 60 0 0 0 156 138" fill="none" stroke="var(--amber-bright)" strokeWidth="1.5" strokeDasharray="2,2" />
                        <text x="175" y="145" fill="var(--amber-bright)" fontSize="13" fontWeight="bold">{tiltAngle}°</text>
                    </svg>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Active Pitch: <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{tiltAngle}° Tilt</span> facing <span style={{ color: 'var(--blue-bright)', fontWeight: 600, textTransform: 'capitalize' }}>{azimuth}</span>
                    </div>
                </div>

                {/* Efficiency Impact Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Geometric Capture Efficiency</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: results.geometricEfficiencyPercent >= 90 ? 'var(--green-bright)' : results.geometricEfficiencyPercent >= 75 ? 'var(--amber-bright)' : 'var(--red)', marginTop: 2 }}>
                            {results.geometricEfficiencyPercent}%
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                            {tiltAngle === optimalTilt ? '✨ Perfect angle alignment' : `${Math.abs(tiltAngle - optimalTilt)}° deviation from optimal`}
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Adjusted Annual Generation</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                            {results.adjustedAnnualYieldKwh} <span style={{ fontSize: 12 }}>kWh/year</span>
                        </div>
                        <div style={{ fontSize: 11, color: results.annualLossRevenue > 0 ? 'var(--red)' : 'var(--green-bright)', marginTop: 2 }}>
                            {results.annualLossRevenue > 0 ? `₹${results.annualLossRevenue} annual yield lost to misalignment/shade` : '₹0 Yield Loss (Maximum Efficiency)'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Geometry & Shading Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {/* 1. Tilt Slider */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Roof Pitch / Tilt Angle:</span>
                        <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>{tiltAngle}°</span>
                    </div>
                    <input
                        type="range" min="0" max="60" step="1"
                        value={tiltAngle}
                        onChange={e => setTiltAngle(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>0° (Flat Roof)</span>
                        <span style={{ color: 'var(--green-bright)', fontWeight: 600 }}>20° (Ideal Central India)</span>
                        <span>60° (Steep Pitch)</span>
                    </div>
                </div>

                {/* 2. Azimuth Orientation */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
                        Compass Azimuth Heading:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {(['south', 'south-east', 'south-west', 'east', 'west', 'north'] as const).map(dir => (
                            <button
                                key={dir}
                                onClick={() => setAzimuth(dir)}
                                style={{
                                    padding: '6px 4px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: azimuth === dir ? 'var(--blue)' : 'var(--surface)',
                                    color: azimuth === dir ? '#fff' : 'var(--t2)',
                                }}
                            >
                                {dir.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Shading Scenarios */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
                        Shading Obstruction Level:
                    </div>
                    <select
                        value={shading}
                        onChange={e => setShading(e.target.value as any)}
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
                        <option value="none">☀️ Clear Horizon (0% Shade Loss)</option>
                        <option value="partial_morning">🌳 Morning Trees / Poles (8% Loss)</option>
                        <option value="partial_afternoon">🏢 Afternoon Parapet / Structure (12% Loss)</option>
                        <option value="heavy_trees">🌲 Dense Foliage & Canopy (22% Loss)</option>
                        <option value="high_rise">🏙️ Nearby High-Rise Tower (35% Loss)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
