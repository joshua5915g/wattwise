'use client';

import React, { useState, useMemo } from 'react';
import type { PredictionResult, Appliance } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ApplianceDispatcherProps {
    prediction: PredictionResult | null;
    electricityRate: number;
}

const DEFAULT_APPLIANCES: Appliance[] = [
    { id: 'ev', name: 'EV 2-Wheeler / Car Charger', powerKw: 2.8, durationHours: 3, preferredTime: 'noon', scheduledStartHour: 11, icon: '🚗', enabled: true },
    { id: 'ac', name: 'Dual Inverter Split AC', powerKw: 1.5, durationHours: 4, preferredTime: 'afternoon', scheduledStartHour: 12, icon: '❄️', enabled: true },
    { id: 'wm', name: 'Front-Load Washing Machine', powerKw: 1.2, durationHours: 2, preferredTime: 'morning', scheduledStartHour: 10, icon: '🧺', enabled: true },
    { id: 'geyser', name: 'Water Geyser / Heat Pump', powerKw: 2.0, durationHours: 1, preferredTime: 'morning', scheduledStartHour: 9, icon: '🚿', enabled: false },
    { id: 'dw', name: 'Eco Dishwasher Cycle', powerKw: 1.1, durationHours: 2, preferredTime: 'afternoon', scheduledStartHour: 13, icon: '🍽️', enabled: false },
    { id: 'work', name: 'Home Office & Workstation', powerKw: 0.4, durationHours: 8, preferredTime: 'morning', scheduledStartHour: 9, icon: '💻', enabled: true },
];

export default function ApplianceDispatcher({ prediction, electricityRate }: ApplianceDispatcherProps) {
    const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPower, setNewPower] = useState(1.0);
    const [newDuration, setNewDuration] = useState(2);
    const [newIcon, setNewIcon] = useState('⚡');

    const hourlySolar = prediction?.hourly_output ?? new Array(24).fill(0);

    // Toggle appliance
    const toggleAppliance = (id: string) => {
        setAppliances(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    };

    // Change start hour
    const updateStartHour = (id: string, hour: number) => {
        setAppliances(prev => prev.map(a => a.id === id ? { ...a, scheduledStartHour: hour } : a));
    };

    // Auto-optimize all enabled appliances to fit into peak solar hours
    const autoOptimize = () => {
        if (!prediction) return;
        const peak = prediction.peak_hour || 12;

        setAppliances(prev => prev.map((a, idx) => {
            // Distribute staggered around peak hour (e.g. 10:00 to 14:00)
            const optimalStart = Math.max(8, Math.min(15, peak - Math.floor(a.durationHours / 2) + (idx % 3) - 1));
            return { ...a, scheduledStartHour: optimalStart };
        }));
    };

    // Add custom appliance
    const handleAddAppliance = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        const newApp: Appliance = {
            id: 'custom-' + Date.now(),
            name: newName,
            powerKw: +newPower,
            durationHours: +newDuration,
            preferredTime: 'any',
            scheduledStartHour: 11,
            icon: newIcon || '⚡',
            enabled: true,
        };
        setAppliances(prev => [...prev, newApp]);
        setNewName('');
        setIsAddingNew(false);
    };

    // Remove appliance
    const removeAppliance = (id: string) => {
        setAppliances(prev => prev.filter(a => a.id !== id));
    };

    // Compute combined 24h load vs solar
    const { hourlyLoad, totalKwhUsed, solarCoveredKwh, gridDrawnKwh, solarCostSaved, gridCostIncurred } = useMemo(() => {
        const load = new Array(24).fill(0);
        let totalUsed = 0;

        appliances.filter(a => a.enabled).forEach(a => {
            for (let h = 0; h < a.durationHours; h++) {
                const hourSlot = (a.scheduledStartHour + h) % 24;
                load[hourSlot] += a.powerKw;
                totalUsed += a.powerKw;
            }
        });

        let solarCovered = 0;
        let gridDrawn = 0;

        for (let h = 0; h < 24; h++) {
            const gen = hourlySolar[h] || 0;
            const demand = load[h];
            const directSolar = Math.min(gen, demand);
            const fromGrid = Math.max(0, demand - gen);

            solarCovered += directSolar;
            gridDrawn += fromGrid;
        }

        const saved = solarCovered * electricityRate;
        const gridCost = gridDrawn * electricityRate;

        return {
            hourlyLoad: load,
            totalKwhUsed: totalUsed,
            solarCoveredKwh: solarCovered,
            gridDrawnKwh: gridDrawn,
            solarCostSaved: saved,
            gridCostIncurred: gridCost,
        };
    }, [appliances, hourlySolar, electricityRate]);

    const selfCoveredPercent = totalKwhUsed > 0 ? Math.round((solarCoveredKwh / totalKwhUsed) * 100) : 100;
    const maxBarValue = Math.max(...hourlySolar, ...hourlyLoad, 1);

    return (
        <div id="load-dispatcher" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🔌</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Smart Appliance Load Dispatcher & Shifter
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Shift heavy home electrical loads to peak solar hours for ₹0 zero-cost solar running
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={autoOptimize}
                        className="btn btn-primary"
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        ✨ Auto-Align to Solar Peak
                    </button>
                    <button
                        onClick={() => setIsAddingNew(!isAddingNew)}
                        className="btn btn-secondary"
                        style={{ fontSize: 12 }}
                    >
                        {isAddingNew ? 'Cancel' : '➕ Add Appliance'}
                    </button>
                </div>
            </div>

            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                <div style={{ background: 'var(--raised)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Solar Self-Covered</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: selfCoveredPercent >= 80 ? 'var(--green-bright)' : selfCoveredPercent >= 50 ? 'var(--amber-bright)' : 'var(--red)', marginTop: 2 }}>
                        {selfCoveredPercent}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{solarCoveredKwh.toFixed(1)} kWh free energy</div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Zero-Cost Solar Savings</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                        {formatCurrency(solarCostSaved)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Saved today vs grid</div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Grid Overflow Draw</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t2)', marginTop: 2 }}>
                        {gridDrawnKwh.toFixed(1)} <span style={{ fontSize: 12 }}>kWh</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>₹{gridCostIncurred.toFixed(0)} billed from grid</div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Active Appliances</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                        {appliances.filter(a => a.enabled).length} / {appliances.length}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Total {totalKwhUsed.toFixed(1)} kWh demand</div>
                </div>
            </div>

            {/* Load vs Solar Generation 24-Hour Heat Overlay */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', borderRadius: 'var(--r)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>
                        24-Hour Solar Supply vs Scheduled Household Demand Overlay
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)' }} />
                            <span style={{ color: 'var(--t2)' }}>Solar Generation (kW)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--blue-bright)' }} />
                            <span style={{ color: 'var(--t2)' }}>Appliance Load (kW)</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 3, height: 100, alignItems: 'flex-end' }}>
                    {Array.from({ length: 24 }).map((_, h) => {
                        const sol = hourlySolar[h] || 0;
                        const dem = hourlyLoad[h] || 0;
                        const solH = (sol / maxBarValue) * 90;
                        const demH = (dem / maxBarValue) * 90;

                        return (
                            <div key={h} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                                <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%', height: '100%', justifyContent: 'center' }}>
                                    {/* Solar bar */}
                                    <div
                                        title={`${h}:00 - Solar: ${sol.toFixed(2)} kW`}
                                        style={{ width: '45%', height: `${Math.max(2, solH)}%`, background: 'var(--amber)', borderRadius: '2px 2px 0 0', opacity: 0.85 }}
                                    />
                                    {/* Demand bar */}
                                    <div
                                        title={`${h}:00 - Demand: ${dem.toFixed(2)} kW`}
                                        style={{ width: '45%', height: `${Math.max(dem > 0 ? 4 : 0, demH)}%`, background: 'var(--blue-bright)', borderRadius: '2px 2px 0 0', opacity: 0.9 }}
                                    />
                                </div>
                                <span style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>{h % 3 === 0 ? `${h}h` : ''}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Custom Appliance Drawer */}
            {isAddingNew && (
                <form onSubmit={handleAddAppliance} className="fade-in" style={{
                    background: 'var(--raised)', border: '1px solid var(--blue)', borderRadius: 'var(--r)',
                    padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end'
                }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <label style={{ fontSize: 11, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Appliance Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Induction Cooktop"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 6, padding: '7px 10px', color: 'var(--t1)', fontSize: 13 }}
                            required
                        />
                    </div>
                    <div style={{ width: 100 }}>
                        <label style={{ fontSize: 11, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Power (kW)</label>
                        <input
                            type="number" step="0.1" min="0.1" max="10"
                            value={newPower}
                            onChange={e => setNewPower(+e.target.value)}
                            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 6, padding: '7px 10px', color: 'var(--t1)', fontSize: 13 }}
                        />
                    </div>
                    <div style={{ width: 100 }}>
                        <label style={{ fontSize: 11, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Hours</label>
                        <input
                            type="number" min="1" max="12"
                            value={newDuration}
                            onChange={e => setNewDuration(+e.target.value)}
                            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 6, padding: '7px 10px', color: 'var(--t1)', fontSize: 13 }}
                        />
                    </div>
                    <div style={{ width: 70 }}>
                        <label style={{ fontSize: 11, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Icon</label>
                        <input
                            type="text"
                            value={newIcon}
                            onChange={e => setNewIcon(e.target.value)}
                            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 6, padding: '7px 10px', color: 'var(--t1)', fontSize: 13, textAlign: 'center' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: 36, fontSize: 12 }}>
                        Add Device
                    </button>
                </form>
            )}

            {/* Appliances Schedule Control List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
                {appliances.map(a => {
                    const isPeakSolar = a.scheduledStartHour >= 10 && a.scheduledStartHour <= 14;
                    return (
                        <div
                            key={a.id}
                            style={{
                                background: a.enabled ? 'var(--raised)' : 'var(--surface)',
                                border: a.enabled ? '1px solid var(--b2)' : '1px solid var(--b1)',
                                borderRadius: 'var(--r)',
                                padding: '14px 16px',
                                opacity: a.enabled ? 1 : 0.6,
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{a.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                                            {a.powerKw} kW · {a.durationHours} hr cycle ({(a.powerKw * a.durationHours).toFixed(1)} kWh)
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={a.enabled}
                                    onChange={() => toggleAppliance(a.id)}
                                    style={{ width: 16, height: 16, accentColor: 'var(--green-bright)', cursor: 'pointer' }}
                                />
                            </div>

                            {/* Start Time Slider */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--t3)' }}>Scheduled Start:</span>
                                    <span style={{ fontWeight: 600, color: isPeakSolar ? 'var(--green-bright)' : 'var(--amber-bright)' }}>
                                        {a.scheduledStartHour}:00 ({isPeakSolar ? '☀️ 100% Free Solar' : '⚡ Grid Draw Likely'})
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0} max={23}
                                    disabled={!a.enabled}
                                    value={a.scheduledStartHour}
                                    onChange={e => updateStartHour(a.id, +e.target.value)}
                                    className="slider-custom"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {a.id.startsWith('custom-') && (
                                <button
                                    onClick={() => removeAppliance(a.id)}
                                    style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
