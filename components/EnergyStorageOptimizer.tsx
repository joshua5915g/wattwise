'use client';

import { useState } from 'react';

interface EnergyStorageOptimizerProps {
    hourlyOutput: number[];
    electricityRate: number;
}

function bestChargeWindow(hourlyOutput: number[]) {
    let bestStart = 9;
    let bestEnergy = -1;

    for (let start = 6; start <= 15; start += 1) {
        const energy = hourlyOutput.slice(start, start + 4).reduce((sum, value) => sum + Math.max(0, value), 0);
        if (energy > bestEnergy) {
            bestStart = start;
            bestEnergy = energy;
        }
    }

    return bestEnergy > 0 ? { start: bestStart } : null;
}

function formatHour(hour: number) {
    return `${String(hour % 12 || 12).padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function EnergyStorageOptimizer({ hourlyOutput, electricityRate }: EnergyStorageOptimizerProps) {
    const [batteryCapacityKwh, setBatteryCapacityKwh] = useState(5);
    const [selfConsumptionPercent, setSelfConsumptionPercent] = useState(35);
    const dailyGenerationKwh = hourlyOutput.reduce((sum, value) => sum + Math.max(0, value), 0);
    const availableSurplus = dailyGenerationKwh * (1 - selfConsumptionPercent / 100);
    const storedEnergy = Math.min(availableSurplus, batteryCapacityKwh);
    const deliveredEnergy = storedEnergy * 0.9;
    const estimatedValue = deliveredEnergy * electricityRate;
    const chargeWindow = bestChargeWindow(hourlyOutput);

    return (
        <section className="card" aria-labelledby="storage-optimizer-title" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div className="section-label">Battery scenario planner</div>
                    <h2 id="storage-optimizer-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Storage Optimization Engine</h2>
                    <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Charge window uses the strongest four-hour block in your hourly generation forecast.</p>
                </div>
                <span className="badge badge-blue">Estimated value ₹{estimatedValue.toFixed(0)}/day</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <label style={{ display: 'grid', gap: 7, color: 'var(--t2)', fontSize: 12 }}>
                    <span>Battery capacity <strong style={{ color: 'var(--t1)' }}>{batteryCapacityKwh} kWh</strong></span>
                    <input aria-label="Battery capacity in kilowatt-hours" type="range" min="1" max="30" step="1" value={batteryCapacityKwh} onChange={(event) => setBatteryCapacityKwh(Number(event.target.value))} />
                </label>
                <label style={{ display: 'grid', gap: 7, color: 'var(--t2)', fontSize: 12 }}>
                    <span>Generation used directly <strong style={{ color: 'var(--t1)' }}>{selfConsumptionPercent}%</strong></span>
                    <input aria-label="Percentage of solar generation used directly" type="range" min="0" max="90" step="5" value={selfConsumptionPercent} onChange={(event) => setSelfConsumptionPercent(Number(event.target.value))} />
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                {[
                    { label: 'Suggested charge', value: chargeWindow ? `${formatHour(chargeWindow.start)} – ${formatHour(chargeWindow.start + 4)}` : 'No solar surplus', color: 'var(--amber-bright)' },
                    { label: 'Surplus available', value: `${availableSurplus.toFixed(1)} kWh`, color: 'var(--blue-bright)' },
                    { label: 'Energy delivered', value: `${deliveredEnergy.toFixed(1)} kWh`, color: 'var(--green-bright)' },
                ].map((metric) => (
                    <div key={metric.label} style={{ padding: 12, borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>{metric.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: metric.color, marginTop: 3 }}>{metric.value}</div>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--t3)' }}>Illustrative estimate assumes 10% battery round-trip loss and values delivered energy at the current import tariff. It excludes battery cost, export credits, and inverter limits.</p>
        </section>
    );
}
