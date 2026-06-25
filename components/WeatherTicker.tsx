'use client';

import { useEffect, useRef, useState } from 'react';
import type { WeatherData } from '@/lib/types';

interface WeatherTickerProps {
    weather: WeatherData | null;
    location: string;
}

function weatherIcon(solar: number, hum: number) {
    if (solar >= 80) return { icon: '☀️', label: 'Clear Sky' };
    if (solar >= 60) return { icon: '🌤️', label: 'Mostly Sunny' };
    if (solar >= 40) return { icon: '⛅', label: 'Partly Cloudy' };
    if (hum > 80)    return { icon: '🌧️', label: 'Heavy Cloud' };
    return              { icon: '☁️', label: 'Overcast' };
}

function Pill({ icon, label, value, accent = 'var(--t2)' }: { icon: string; label: string; value: string; accent?: string }) {
    const [key, setKey] = useState(0);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) { setKey(k => k + 1); prev.current = value; }
    }, [value]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 16px', borderRadius: 10, minWidth: 72, flexShrink: 0,
            background: 'var(--raised)', border: '1px solid var(--b1)',
        }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--t3)' }}>{label}</span>
            <span key={key} style={{ fontSize: 13, fontWeight: 600, color: accent, fontVariantNumeric: 'tabular-nums' }}
                className="value-update">
                {value}
            </span>
        </div>
    );
}

export default function WeatherTicker({ weather, location }: WeatherTickerProps) {
    if (!weather) {
        return (
            <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    {[72, 72, 72, 72, 72, 160].map((w, i) => (
                        <div key={i} style={{ width: w, height: 80, borderRadius: 10, background: 'var(--raised)', animation: 'pulse 2s ease infinite', flexShrink: 0 }} />
                    ))}
                </div>
            </div>
        );
    }

    const { icon, label } = weatherIcon(weather.solar_index, weather.humidity);
    const timeStr = new Date(weather.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="card" style={{ padding: '14px 20px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                        background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.25)',
                        color: 'var(--green-bright)', padding: '3px 10px', borderRadius: 6,
                    }}>
                        <span className="live-dot" style={{ width: 5, height: 5 }} />
                        Live Weather
                    </span>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'var(--t3)' }}>·</span>
                    <span style={{ fontSize: 13, color: 'var(--t2)' }}>📍 {location.split(',')[0]}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--t3)' }}>Updated {timeStr}</span>
            </div>

            {/* Pills row */}
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
                <Pill icon="🌡️" label="Temp"     value={`${weather.temperature.toFixed(1)}°C`}   accent="var(--amber-bright)" />
                <Pill icon="💧" label="Humidity" value={`${weather.humidity.toFixed(0)}%`}         accent="var(--blue-bright)"  />
                <Pill icon="☀️" label="UV Index" value={weather.uv_index.toFixed(1)}               accent="var(--amber-bright)" />
                <Pill icon="💨" label="Wind"     value={`${weather.wind_speed.toFixed(0)} km/h`}   accent="var(--t2)"           />
                <Pill icon="⚡" label="Solar"    value={`${weather.solar_index.toFixed(0)}%`}      accent="var(--green-bright)" />

                {/* Solar potential bar */}
                <div style={{
                    flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 10,
                    background: 'var(--raised)', border: '1px solid var(--b1)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--t3)' }}>Solar Potential</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-bright)', fontVariantNumeric: 'tabular-nums' }}>{weather.solar_index.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{
                            width: `${weather.solar_index}%`,
                            background: 'linear-gradient(90deg, var(--green), var(--green-bright))',
                        }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                        {weather.solar_index >= 70 ? 'Excellent generation conditions'
                            : weather.solar_index >= 40 ? 'Moderate generation expected'
                                : 'Low generation — heavy cloud cover'}
                    </div>
                </div>
            </div>
        </div>
    );
}
