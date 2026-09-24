'use client';

import React, { useState, useEffect } from 'react';
import { LOCATIONS } from '@/lib/constants';

export interface SatelliteSolarData {
    location: string;
    latitude: number;
    longitude: number;
    currentGhi: number;
    currentDni: number;
    currentDhi: number;
    clearnessIndex: number;
    peakGhiToday: number;
    dailySolarEnergyKwhM2: number;
    hourlyGhi: number[];
    hourlyDni: number[];
    source: 'live_open_meteo' | 'physics_satellite_model';
    timestamp: string;
}

interface SatelliteSolarRadiationProps {
    currentLocation: string;
}

export default function SatelliteSolarRadiation({
    currentLocation
}: SatelliteSolarRadiationProps) {
    const [data, setData] = useState<SatelliteSolarData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastSync, setLastSync] = useState<string>('');

    const locCoords = LOCATIONS[currentLocation] || { lat: 19.0760, lon: 72.8777 };

    const fetchSatelliteSolar = async () => {
        setLoading(true);
        try {
            const url = `/api/satellite_solar?lat=${locCoords.lat}&lon=${locCoords.lon}&location=${encodeURIComponent(currentLocation)}`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (e) {
            console.error('Failed to fetch satellite radiation:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSatelliteSolar();
        // Poll every 3 minutes
        const interval = setInterval(fetchSatelliteSolar, 180000);
        return () => clearInterval(interval);
    }, [currentLocation]);

    const currentHour = new Date().getHours();

    return (
        <div id="satellite-solar" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🛰️</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Live Satellite Solar Radiation & Irradiance Stream (GHI / DNI / DHI)
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Direct Open-Meteo & ECMWF atmospheric reanalysis streaming live irradiance flux (W/m²) for {currentLocation.split(',')[0]}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={fetchSatelliteSolar}
                        disabled={loading}
                        className="btn btn-secondary"
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                        <span>{loading ? '📡 Syncing...' : '🔄 Poll Satellite'}</span>
                    </button>
                    <span className={`badge ${data?.source === 'live_open_meteo' ? 'badge-green' : 'badge-blue'}`}>
                        {data?.source === 'live_open_meteo' ? '📡 Live Satellite Stream' : '🧪 Physics Model'}
                    </span>
                </div>
            </div>

            {/* 4 Real-time Irradiance Telemetry Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* 1. GHI */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GHI (Global Horizontal)</span>
                        <span style={{ fontSize: 12 }}>☀️</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 4 }}>
                        {data ? data.currentGhi : 0} <span style={{ fontSize: 12, fontWeight: 500 }}>W/m²</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                        Total solar irradiance hitting flat surface
                    </div>
                </div>

                {/* 2. DNI */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DNI (Direct Normal)</span>
                        <span style={{ fontSize: 12 }}>🎯</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 4 }}>
                        {data ? data.currentDni : 0} <span style={{ fontSize: 12, fontWeight: 500 }}>W/m²</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                        Direct ray beam normal to sun angle
                    </div>
                </div>

                {/* 3. DHI */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DHI (Diffuse Horizontal)</span>
                        <span style={{ fontSize: 12 }}>☁️</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan-bright)', marginTop: 4 }}>
                        {data ? data.currentDhi : 0} <span style={{ fontSize: 12, fontWeight: 500 }}>W/m²</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                        Atmospheric & cloud scattered light
                    </div>
                </div>

                {/* 4. Daily Insolation Flux */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Solar Insolation</span>
                        <span style={{ fontSize: 12 }}>⚡</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-bright)', marginTop: 4 }}>
                        {data ? data.dailySolarEnergyKwhM2 : 0} <span style={{ fontSize: 12, fontWeight: 500 }}>kWh/m²</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                        Clearness Index Kt: <strong>{data ? data.clearnessIndex : 0.8}</strong>
                    </div>
                </div>
            </div>

            {/* Satellite 24-Hour Solar Radiation Curve SVG */}
            <div style={{ background: 'var(--raised)', padding: '16px 20px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                        24-Hour Satellite Solar Irradiance Profile (GHI vs DNI)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                        Peak Today: <strong style={{ color: 'var(--amber-bright)' }}>{data?.peakGhiToday || 850} W/m²</strong> · Last Sync: {lastSync || 'Just now'}
                    </div>
                </div>

                {/* SVG Line Chart */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg viewBox="0 0 600 130" style={{ width: '100%', minWidth: 450, height: 130, overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="ghiArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="dniArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 30, 60, 90, 120].map((y, idx) => (
                            <line key={idx} x1="30" y1={y} x2="590" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        ))}

                        {/* Y-axis labels */}
                        <text x="5" y="15" fill="var(--t3)" fontSize="9">1000 W</text>
                        <text x="5" y="65" fill="var(--t3)" fontSize="9">500 W</text>
                        <text x="5" y="115" fill="var(--t3)" fontSize="9">0 W</text>

                        {/* Path points calculation */}
                        {(() => {
                            const ghiPoints = (data?.hourlyGhi || []).map((val, i) => {
                                const x = 30 + (i / 23) * 560;
                                const y = 120 - Math.min(110, (val / 1000) * 110);
                                return `${x},${y}`;
                            }).join(' ');

                            const dniPoints = (data?.hourlyDni || []).map((val, i) => {
                                const x = 30 + (i / 23) * 560;
                                const y = 120 - Math.min(110, (val / 1000) * 110);
                                return `${x},${y}`;
                            }).join(' ');

                            if (!ghiPoints) return null;

                            return (
                                <>
                                    {/* Area fills */}
                                    <polygon points={`30,120 ${ghiPoints} 590,120`} fill="url(#ghiArea)" />

                                    {/* GHI Stroke */}
                                    <polyline points={ghiPoints} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

                                    {/* DNI Stroke */}
                                    <polyline points={dniPoints} fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeDasharray="3,3" />

                                    {/* Current Hour Indicator Marker */}
                                    {(() => {
                                        const curX = 30 + (currentHour / 23) * 560;
                                        const curVal = data?.hourlyGhi?.[currentHour] || 0;
                                        const curY = 120 - Math.min(110, (curVal / 1000) * 110);
                                        return (
                                            <g>
                                                <line x1={curX} y1="10" x2={curX} y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2,2" />
                                                <circle cx={curX} cy={curY} r="4.5" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
                                                <text x={curX - 18} y="130" fill="#10B981" fontSize="9" fontWeight="bold">Now ({currentHour}:00)</text>
                                            </g>
                                        );
                                    })()}
                                </>
                            );
                        })()}

                        {/* X-axis ticks */}
                        {[0, 6, 12, 18, 23].map((h, i) => (
                            <text key={i} x={30 + (h / 23) * 560 - 10} y="128" fill="var(--t3)" fontSize="9">
                                {h}:00
                            </text>
                        ))}
                    </svg>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, fontSize: 11, color: 'var(--t2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 3, background: '#F59E0B', borderRadius: 2 }} />
                        <span>GHI (Total Irradiance)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 3, background: '#60A5FA', borderRadius: 2 }} />
                        <span>DNI (Direct Beam)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
                        <span>Current Solar Hour</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
