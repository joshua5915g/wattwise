'use client';

import React, { useState } from 'react';
import type { PredictionResult } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
    prediction: PredictionResult;
    electricityRate: number;
}

export default function BatteryOptimization({ prediction, electricityRate }: Props) {
    const [batteryCapacity, setBatteryCapacity] = useState(5.0);

    const instantUsagePercent = 0.30;
    const excessEnergy = prediction.total_daily_output * (1 - instantUsagePercent);
    const storedEnergy = Math.min(excessEnergy, batteryCapacity);
    const nightSavings = storedEnergy * electricityRate;
    const monthlySavings = nightSavings * 30;
    const averageHomeConsumptionDaily = 15.0;
    const offsetPercentage = Math.min(100, (storedEnergy / averageHomeConsumptionDaily) * 100);
    const batteryFillPercent = Math.min(100, (storedEnergy / batteryCapacity) * 100);

    // Battery charge color
    const batteryColor = batteryFillPercent >= 70
        ? '#10b981'
        : batteryFillPercent >= 40
            ? '#f59e0b'
            : '#f87171';

    // ROI estimate (rough)
    const annualSavings = monthlySavings * 12;
    const batteryInstallCost = batteryCapacity * 15000; // ₹15,000/kWh rough estimate
    const paybackYears = annualSavings > 0 ? (batteryInstallCost / annualSavings).toFixed(1) : '—';

    return (
        <div id="battery" className="glass-card p-6 relative overflow-hidden fade-in">
            <div
                className="metric-card-accent"
                style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4, transparent)' }}
            />

            {/* Background icon */}
            <div className="absolute right-6 bottom-4 text-8xl opacity-[0.04] select-none pointer-events-none">
                🔋
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
                            border: '1px solid rgba(16,185,129,0.3)',
                            boxShadow: '0 0 20px rgba(16,185,129,0.15)',
                        }}
                    >
                        🔋
                    </div>
                    <div>
                        <div className="section-title">Battery Storage Optimizer</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            Simulate night-time energy storage and savings
                        </div>
                    </div>
                </div>
                <div className="badge badge-green">⚡ {storedEnergy.toFixed(1)} kWh stored</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ── Controls ── */}
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                Battery Capacity
                            </span>
                            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                                {batteryCapacity.toFixed(1)} kWh
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1.0"
                            max="20.0"
                            step="0.5"
                            value={batteryCapacity}
                            onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                            <span>1 kWh</span><span>20 kWh</span>
                        </div>
                    </div>

                    {/* Energy breakdown */}
                    <div
                        className="p-4 rounded-xl space-y-2.5 text-sm"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Daily Output</span>
                            <span className="font-semibold text-white">{prediction.total_daily_output.toFixed(1)} kWh</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Instant Usage (30%)</span>
                            <span className="font-semibold" style={{ color: '#f59e0b' }}>
                                {(prediction.total_daily_output * 0.3).toFixed(1)} kWh
                            </span>
                        </div>
                        <div className="divider" />
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Excess Available</span>
                            <span className="font-semibold" style={{ color: '#06b6d4' }}>{excessEnergy.toFixed(1)} kWh</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Stored in Battery</span>
                            <span className="font-bold" style={{ color: '#10b981' }}>{storedEnergy.toFixed(1)} kWh</span>
                        </div>
                    </div>
                </div>

                {/* ── Battery visual ── */}
                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Battery SVG */}
                    <div className="relative">
                        <svg width="80" height="150" viewBox="0 0 80 150">
                            {/* Battery terminal */}
                            <rect x="28" y="0" width="24" height="10" rx="4" fill="rgba(255,255,255,0.15)" />
                            {/* Battery body */}
                            <rect x="4" y="10" width="72" height="130" rx="12"
                                fill="rgba(255,255,255,0.04)"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1.5"
                            />
                            {/* Fill */}
                            <rect
                                x="6"
                                y={10 + (130 * (1 - batteryFillPercent / 100))}
                                width="68"
                                height={130 * (batteryFillPercent / 100)}
                                rx="10"
                                fill={batteryColor}
                                opacity="0.8"
                                style={{ transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                            {/* Glow overlay */}
                            <rect
                                x="6"
                                y={10 + (130 * (1 - batteryFillPercent / 100))}
                                width="68"
                                height={130 * (batteryFillPercent / 100)}
                                rx="10"
                                fill="url(#battGrad)"
                                opacity="0.4"
                                style={{ transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                            {/* % text */}
                            <text x="40" y="82" textAnchor="middle" fontSize="18" fontWeight="700"
                                fill="white" fontFamily="'Space Grotesk', sans-serif" opacity="0.9">
                                {batteryFillPercent.toFixed(0)}%
                            </text>
                            <defs>
                                <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Glow */}
                        <div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                                boxShadow: `0 0 30px ${batteryColor}30`,
                                transition: 'box-shadow 0.6s ease',
                            }}
                        />
                    </div>
                    <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                        {batteryCapacity.toFixed(1)} kWh capacity
                    </div>
                </div>

                {/* ── Savings metrics ── */}
                <div className="space-y-4">
                    {/* Night savings */}
                    <div
                        className="p-4 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
                    >
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Night-time Savings
                        </div>
                        <div className="text-2xl font-bold font-display" style={{ color: '#10b981' }}>
                            +{formatCurrency(nightSavings)}/day
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            ≈ {formatCurrency(monthlySavings)}/month
                        </div>
                    </div>

                    {/* ROI */}
                    <div
                        className="p-4 rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
                    >
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Est. Payback Period
                        </div>
                        <div className="text-2xl font-bold font-display" style={{ color: '#f59e0b' }}>
                            {paybackYears} yrs
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            at ₹15k/kWh install cost
                        </div>
                    </div>

                    {/* Grid offset progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                Nightly Grid Offset
                            </span>
                            <span className="text-xs font-bold" style={{ color: '#06b6d4' }}>
                                {offsetPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${offsetPercentage}%`,
                                    background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                                    boxShadow: '0 0 8px rgba(6,182,212,0.4)',
                                }}
                            />
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                            of 15 kWh avg. daily home consumption
                        </div>
                    </div>

                    {/* Annual */}
                    <div className="divider" />
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Annual savings projection:{' '}
                        <span className="font-bold" style={{ color: '#fbbf24' }}>
                            {formatCurrency(annualSavings)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
