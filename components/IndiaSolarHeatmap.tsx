'use client';

import React, { useState } from 'react';
import { LOCATIONS } from '@/lib/constants';

interface IndiaSolarHeatmapProps {
    currentLocation: string;
    onSelectLocation: (loc: string) => void;
}

interface SolarHub {
    id: string;
    name: string;
    state: string;
    x: number; // SVG coordinate percent
    y: number;
    solarGhi: number; // kWh/m2/day
    avgTariff: number; // ₹/kWh buyback
    cloudCover: number; // %
    tier: 'Ultra High' | 'High' | 'Moderate';
}

const SOLAR_HUBS: SolarHub[] = [
    { id: 'jaipur', name: 'Jaipur, Rajasthan', state: 'Rajasthan', x: 30, y: 35, solarGhi: 6.3, avgTariff: 7.8, cloudCover: 12, tier: 'Ultra High' },
    { id: 'ahmedabad', name: 'Ahmedabad, Gujarat', state: 'Gujarat', x: 22, y: 48, solarGhi: 6.1, avgTariff: 7.5, cloudCover: 15, tier: 'Ultra High' },
    { id: 'delhi', name: 'Delhi, NCR', state: 'Delhi NCR', x: 38, y: 28, solarGhi: 5.2, avgTariff: 8.0, cloudCover: 22, tier: 'High' },
    { id: 'mumbai', name: 'Mumbai, Maharashtra', state: 'Maharashtra', x: 28, y: 64, solarGhi: 5.6, avgTariff: 8.5, cloudCover: 30, tier: 'High' },
    { id: 'pune', name: 'Pune, Maharashtra', state: 'Maharashtra', x: 32, y: 68, solarGhi: 5.7, avgTariff: 8.5, cloudCover: 25, tier: 'High' },
    { id: 'bangalore', name: 'Bangalore, Karnataka', state: 'Karnataka', x: 42, y: 84, solarGhi: 5.8, avgTariff: 7.9, cloudCover: 20, tier: 'High' },
    { id: 'chennai', name: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', x: 52, y: 85, solarGhi: 5.9, avgTariff: 8.2, cloudCover: 28, tier: 'High' },
    { id: 'hyderabad', name: 'Hyderabad, Telangana', state: 'Telangana', x: 46, y: 66, solarGhi: 5.7, avgTariff: 7.6, cloudCover: 18, tier: 'High' },
    { id: 'kolkata', name: 'Kolkata, West Bengal', state: 'West Bengal', x: 74, y: 48, solarGhi: 4.8, avgTariff: 8.1, cloudCover: 40, tier: 'Moderate' },
    { id: 'lucknow', name: 'Lucknow, Uttar Pradesh', state: 'Uttar Pradesh', x: 50, y: 34, solarGhi: 5.1, avgTariff: 7.4, cloudCover: 24, tier: 'Moderate' },
    { id: 'bhopal', name: 'Bhopal, Madhya Pradesh', state: 'Madhya Pradesh', x: 40, y: 49, solarGhi: 5.8, avgTariff: 7.7, cloudCover: 16, tier: 'High' },
    { id: 'kochi', name: 'Kochi, Kerala', state: 'Kerala', x: 38, y: 92, solarGhi: 5.3, avgTariff: 7.2, cloudCover: 45, tier: 'Moderate' },
    { id: 'srinagar', name: 'Srinagar, Jammu & Kashmir', state: 'J&K', x: 32, y: 12, solarGhi: 4.5, avgTariff: 6.8, cloudCover: 35, tier: 'Moderate' },
    { id: 'guwahati', name: 'Guwahati, Assam', state: 'Assam', x: 88, y: 36, solarGhi: 4.4, avgTariff: 7.0, cloudCover: 52, tier: 'Moderate' }
];

export default function IndiaSolarHeatmap({ currentLocation, onSelectLocation }: IndiaSolarHeatmapProps) {
    const [selectedHub, setSelectedHub] = useState<SolarHub>(
        SOLAR_HUBS.find(h => h.name.toLowerCase().includes(currentLocation.split(',')[0].toLowerCase())) || SOLAR_HUBS[0]
    );
    const [showCloudRadar, setShowCloudRadar] = useState<boolean>(true);

    const handleHubClick = (hub: SolarHub) => {
        setSelectedHub(hub);
        if (LOCATIONS[hub.name]) {
            onSelectLocation(hub.name);
        }
    };

    return (
        <div id="heatmap" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🗺️</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            India Solar Irradiance Heatmap & Satellite Radar
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Interactive GHI ($kWh/m^2/day$) irradiance map — Click any hub to reload live dashboard telemetry
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setShowCloudRadar(!showCloudRadar)}
                        className={`btn ${showCloudRadar ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12 }}
                    >
                        {showCloudRadar ? '☁️ Satellite Radar Active' : '☀️ Irradiance View'}
                    </button>
                    <span className="badge badge-amber">
                        ☀️ Selected: {selectedHub.name.split(',')[0]}
                    </span>
                </div>
            </div>

            {/* Main Interactive Map & Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 320px', gap: 18, alignItems: 'center' }}>
                {/* SVG India Map Graphic */}
                <div style={{
                    position: 'relative',
                    background: 'radial-gradient(circle at 45% 50%, rgba(245,158,11,0.08) 0%, rgba(9,9,15,0.95) 75%)',
                    border: '1px solid var(--b1)',
                    borderRadius: 'var(--r-lg)',
                    padding: '24px',
                    height: 380,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Stylized geometric India contour outline */}
                        <polygon
                            points="32,8 42,14 44,22 55,26 62,32 75,34 90,32 94,40 85,46 76,46 72,56 60,68 54,82 44,95 38,92 34,78 26,68 22,54 18,44 26,32 30,16"
                            fill="#16161F"
                            stroke="rgba(59,130,246,0.3)"
                            strokeWidth="0.8"
                            strokeDasharray="2,2"
                        />

                        {/* Solar Irradiance Heatmap Zones */}
                        {/* High Irradiance Zone - Thar / West (Golden/Amber) */}
                        <circle cx="28" cy="40" r="14" fill="rgba(245,158,11,0.22)" filter="blur(4px)" />
                        {/* High Irradiance Deccan / South (Greenish/Amber) */}
                        <circle cx="44" cy="74" r="16" fill="rgba(34,197,94,0.18)" filter="blur(5px)" />
                        {/* Northern Plains (Blue) */}
                        <circle cx="46" cy="30" r="12" fill="rgba(59,130,246,0.15)" filter="blur(4px)" />

                        {/* Cloud Radar Overlay Particles if active */}
                        {showCloudRadar && (
                            <g opacity="0.35">
                                <circle cx="78" cy="48" r="8" fill="#fff" filter="blur(6px)" />
                                <circle cx="38" cy="90" r="7" fill="#fff" filter="blur(5px)" />
                                <circle cx="50" cy="32" r="6" fill="#fff" filter="blur(4px)" />
                            </g>
                        )}

                        {/* City Hub Markers */}
                        {SOLAR_HUBS.map(hub => {
                            const isSelected = selectedHub.id === hub.id;
                            const isCurrent = currentLocation.toLowerCase().includes(hub.name.split(',')[0].toLowerCase());

                            return (
                                <g
                                    key={hub.id}
                                    transform={`translate(${hub.x}, ${hub.y})`}
                                    onClick={() => handleHubClick(hub)}
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                >
                                    {/* Pulse ring for active location */}
                                    {(isSelected || isCurrent) && (
                                        <circle cx="0" cy="0" r="3.5" fill="none" stroke={isCurrent ? '#4ADE80' : '#FCD34D'} strokeWidth="0.5" className="flow-active" />
                                    )}
                                    <circle
                                        cx="0" cy="0" r={isSelected ? "2.2" : "1.6"}
                                        fill={isCurrent ? '#22C55E' : hub.solarGhi >= 6.0 ? '#F59E0B' : hub.solarGhi >= 5.2 ? '#60A5FA' : '#94A3B8'}
                                        stroke="#09090F"
                                        strokeWidth="0.5"
                                    />
                                    <text
                                        x="0" y="-2.5" textAnchor="middle"
                                        fill={isSelected ? '#FCD34D' : '#9898A6'}
                                        fontSize="2.4"
                                        fontWeight={isSelected ? 'bold' : 'normal'}
                                    >
                                        {hub.name.split(',')[0]}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Selected Hub Inspector Card */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b2)', borderRadius: 'var(--r-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>📍 {selectedHub.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>State: {selectedHub.state}</div>
                        </div>
                        <span className={`badge ${selectedHub.tier === 'Ultra High' ? 'badge-amber' : selectedHub.tier === 'High' ? 'badge-green' : 'badge-blue'}`}>
                            {selectedHub.tier} GHI
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--b1)', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>☀️ Solar Irradiance (GHI)</span>
                            <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>{selectedHub.solarGhi} kWh/m²/day</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--b1)', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>⚡ State DISCOM Tariff</span>
                            <span style={{ fontWeight: 700, color: 'var(--green-bright)' }}>₹{selectedHub.avgTariff}/kWh</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--b1)', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>☁️ Cloud Cover Index</span>
                            <span style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>{selectedHub.cloudCover}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                            <span style={{ color: 'var(--t2)' }}>🏆 Solar Potential Rank</span>
                            <span style={{ fontWeight: 700, color: 'var(--t1)' }}>Top {selectedHub.tier === 'Ultra High' ? '5%' : '20%'} in India</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleHubClick(selectedHub)}
                        className="btn btn-primary"
                        style={{ marginTop: 6, fontSize: 12, justifyContent: 'center' }}
                    >
                        🚀 Switch Dashboard to {selectedHub.name.split(',')[0]}
                    </button>
                </div>
            </div>
        </div>
    );
}
