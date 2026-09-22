'use client';

import React, { useMemo, useState } from 'react';
import type { WeatherData, ForecastDay } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Forecast7DayProps {
    weather: WeatherData | null;
    panelKw: number;
    rate: number;
}

export default function Forecast7Day({ weather, panelKw, rate }: Forecast7DayProps) {
    const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

    const forecastData = useMemo<ForecastDay[]>(() => {
        const days: ForecastDay[] = [];
        const today = new Date();
        const baseTemp = weather?.temperature ?? 29;
        const baseSolarIdx = weather?.solar_index ?? 78;

        // Realistic multi-day simulation factors for Indian weather variations
        const dailyVariations = [
            { tempDelta: 0, solarDelta: 0, cond: 'sunny', label: 'Bright Sun', icon: '☀️' },
            { tempDelta: 1.2, solarDelta: -5, cond: 'sunny', label: 'Clear Sky', icon: '☀️' },
            { tempDelta: -0.8, solarDelta: -12, cond: 'partly-cloudy', label: 'Passing Clouds', icon: '⛅' },
            { tempDelta: -2.1, solarDelta: -28, cond: 'cloudy', label: 'Overcast', icon: '☁️' },
            { tempDelta: 0.5, solarDelta: -8, cond: 'partly-cloudy', label: 'Scattered Clouds', icon: '⛅' },
            { tempDelta: 1.8, solarDelta: 4, cond: 'sunny', label: 'Peak Sunlight', icon: '☀️' },
            { tempDelta: -1.0, solarDelta: -18, cond: 'hazy', label: 'Mild Haze', icon: '🌫️' },
        ];

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);

            const v = dailyVariations[i];
            const temp = Math.max(15, Math.min(46, +(baseTemp + v.tempDelta).toFixed(1)));
            const solarIdx = Math.max(10, Math.min(98, +(baseSolarIdx + v.solarDelta).toFixed(0)));
            const cloudCover = Math.max(0, Math.min(100, 100 - solarIdx));

            // Solar generation model
            const tempDerating = Math.max(0.75, 1 - Math.max(0, temp - 25) * 0.004);
            const cloudFactor = Math.max(0.2, (100 - cloudCover * 0.75) / 100);
            const peakSunHours = (solarIdx / 100) * 5.8;
            const predictedKwh = +(panelKw * peakSunHours * tempDerating * cloudFactor).toFixed(2);
            const predictedSavings = +(predictedKwh * rate).toFixed(0);

            const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
            const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            days.push({
                dayLabel,
                date: dateStr,
                temp,
                cloudCover,
                solarIndex: solarIdx,
                predictedKwh,
                predictedSavings,
                weatherCondition: v.cond as ForecastDay['weatherCondition'],
                conditionLabel: v.label,
                icon: v.icon,
                peakHours: '11:00 AM – 2:30 PM',
            });
        }
        return days;
    }, [weather, panelKw, rate]);

    const totalKwh = forecastData.reduce((acc, d) => acc + d.predictedKwh, 0);
    const totalSavings = forecastData.reduce((acc, d) => acc + d.predictedSavings, 0);
    const avgKwh = (totalKwh / 7).toFixed(1);
    const bestDay = [...forecastData].sort((a, b) => b.predictedKwh - a.predictedKwh)[0];
    const selectedDay = forecastData[selectedDayIdx] || forecastData[0];
    const maxKwh = Math.max(...forecastData.map(d => d.predictedKwh), 1);

    return (
        <div id="forecast" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>📅</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            7-Day Solar Yield & Weather Outlook
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Multi-day generation forecast with cloud probability and peak solar dispatch windows
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">⚡ Weekly: {totalKwh.toFixed(1)} kWh</span>
                    <span className="badge badge-green">💰 Est: {formatCurrency(totalSavings)}</span>
                </div>
            </div>

            {/* Quick summary stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                <div style={{ background: 'var(--raised)', padding: '10px 14px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>7-Day Total Yield</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber-bright)', marginTop: 2 }}>{totalKwh.toFixed(1)} <span style={{ fontSize: 12 }}>kWh</span></div>
                </div>
                <div style={{ background: 'var(--raised)', padding: '10px 14px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>7-Day Est. Savings</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-bright)', marginTop: 2 }}>{formatCurrency(totalSavings)}</div>
                </div>
                <div style={{ background: 'var(--raised)', padding: '10px 14px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Daily Average</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-bright)', marginTop: 2 }}>{avgKwh} <span style={{ fontSize: 12 }}>kWh/day</span></div>
                </div>
                <div style={{ background: 'var(--raised)', padding: '10px 14px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Best Day For High Loads</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber-bright)', marginTop: 4 }}>
                        ☀️ {bestDay.dayLabel} ({bestDay.predictedKwh} kWh)
                    </div>
                </div>
            </div>

            {/* 7-Day interactive cards horizontal scroll / grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {forecastData.map((d, idx) => {
                    const isSelected = idx === selectedDayIdx;
                    const heightPercent = Math.max(15, (d.predictedKwh / maxKwh) * 100);

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedDayIdx(idx)}
                            style={{
                                background: isSelected ? 'var(--blue-dim)' : 'var(--raised)',
                                border: isSelected ? '1px solid var(--blue-bright)' : '1px solid var(--b1)',
                                borderRadius: 'var(--r)',
                                padding: '14px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}
                        >
                            {idx === 0 && (
                                <span style={{
                                    position: 'absolute', top: -7, background: 'var(--green)', color: '#000',
                                    fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 99, letterSpacing: '0.04em'
                                }}>
                                    NOW
                                </span>
                            )}
                            <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--t1)' : 'var(--t2)' }}>
                                {d.dayLabel}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{d.date}</div>

                            <div style={{ fontSize: 24, margin: '2px 0' }}>{d.icon}</div>
                            <div style={{ fontSize: 11, color: 'var(--t2)', textAlign: 'center', minHeight: 16 }}>
                                {d.conditionLabel}
                            </div>

                            {/* Relative mini generation bar */}
                            <div style={{ width: '100%', height: 4, background: 'var(--b1)', borderRadius: 99, overflow: 'hidden', margin: '4px 0' }}>
                                <div style={{
                                    width: `${heightPercent}%`,
                                    height: '100%',
                                    background: d.solarIndex >= 70 ? 'var(--green)' : d.solarIndex >= 45 ? 'var(--amber)' : 'var(--red)',
                                    borderRadius: 99
                                }} />
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
                                {d.predictedKwh} <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>kWh</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--green-bright)', fontWeight: 600 }}>
                                ₹{d.predictedSavings}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Day Detailed Breakdown Inspector */}
            {selectedDay && (
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r)',
                    padding: '14px 18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 28 }}>{selectedDay.icon}</span>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
                                {selectedDay.dayLabel} ({selectedDay.date}) Deep Forecast Details
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                                🌡️ {selectedDay.temp}°C · ☁️ {selectedDay.cloudCover}% Cloud Cover · ☀️ Solar Index: {selectedDay.solarIndex}/100
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Optimal Solar Window</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-bright)' }}>{selectedDay.peakHours}</div>
                        </div>
                        <div style={{ width: 1, height: 28, background: 'var(--b1)' }} />
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Expected Carbon Offset</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-bright)' }}>
                                {(selectedDay.predictedKwh * 0.82).toFixed(1)} kg CO₂
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
