'use client';

import { useState } from 'react';

interface SolarIndependenceSimulatorProps {
    dailyGenerationKwh: number;
}

export default function SolarIndependenceSimulator({ dailyGenerationKwh }: SolarIndependenceSimulatorProps) {
    const [dailyUsageKwh, setDailyUsageKwh] = useState(15);
    const [daytimeShare, setDaytimeShare] = useState(45);
    const [batteryCapacityKwh, setBatteryCapacityKwh] = useState(5);

    const daytimeUsage = dailyUsageKwh * daytimeShare / 100;
    const nightUsage = dailyUsageKwh - daytimeUsage;
    const directSolar = Math.min(dailyGenerationKwh, daytimeUsage);
    const surplus = Math.max(0, dailyGenerationKwh - directSolar);
    const storedEnergy = Math.min(surplus, batteryCapacityKwh) * 0.9;
    const gridImport = Math.max(0, nightUsage - storedEnergy);
    const gridExport = Math.max(0, surplus - batteryCapacityKwh);
    const solarServed = directSolar + Math.min(nightUsage, storedEnergy);
    const independence = dailyUsageKwh > 0 ? Math.min(100, solarServed / dailyUsageKwh * 100) : 0;

    return (
        <section className="card" aria-labelledby="independence-title" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <div className="section-label">Household energy scenario</div>
                <h2 id="independence-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Energy Independence Simulator</h2>
                <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Explore estimated grid reliance from your forecast, usage profile, and battery size.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                <label style={{ display: 'grid', gap: 7, color: 'var(--t2)', fontSize: 12 }}>
                    <span>Daily household use <strong style={{ color: 'var(--t1)' }}>{dailyUsageKwh} kWh</strong></span>
                    <input aria-label="Daily household use in kilowatt-hours" type="range" min="3" max="60" step="1" value={dailyUsageKwh} onChange={(event) => setDailyUsageKwh(Number(event.target.value))} />
                </label>
                <label style={{ display: 'grid', gap: 7, color: 'var(--t2)', fontSize: 12 }}>
                    <span>Usage during daylight <strong style={{ color: 'var(--t1)' }}>{daytimeShare}%</strong></span>
                    <input aria-label="Percentage of energy use during daylight" type="range" min="10" max="90" step="5" value={daytimeShare} onChange={(event) => setDaytimeShare(Number(event.target.value))} />
                </label>
                <label style={{ display: 'grid', gap: 7, color: 'var(--t2)', fontSize: 12 }}>
                    <span>Battery capacity <strong style={{ color: 'var(--t1)' }}>{batteryCapacityKwh} kWh</strong></span>
                    <input aria-label="Battery capacity in kilowatt-hours" type="range" min="0" max="30" step="1" value={batteryCapacityKwh} onChange={(event) => setBatteryCapacityKwh(Number(event.target.value))} />
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 10 }}>
                {[
                    { label: 'Solar independence', value: `${independence.toFixed(0)}%`, color: 'var(--green-bright)' },
                    { label: 'Grid import', value: `${gridImport.toFixed(1)} kWh/day`, color: 'var(--amber-bright)' },
                    { label: 'Potential export', value: `${gridExport.toFixed(1)} kWh/day`, color: 'var(--blue-bright)' },
                    { label: 'Solar generation', value: `${dailyGenerationKwh.toFixed(1)} kWh/day`, color: 'var(--t1)' },
                ].map((metric) => (
                    <div key={metric.label} style={{ padding: 12, borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>{metric.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: metric.color, marginTop: 3 }}>{metric.value}</div>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--t3)' }}>Illustrative daily balance. Battery losses are estimated at 10%; actual tariffs, system controls, and consumption patterns change results.</p>
        </section>
    );
}
