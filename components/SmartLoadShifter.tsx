'use client';

interface SmartLoadShifterProps {
    hourlyOutput: number[];
    electricityRate: number;
}

const APPLIANCES = [
    { name: 'Water heater', powerKw: 2, durationHours: 2, icon: '🚿' },
    { name: 'Washing machine', powerKw: 1, durationHours: 1, icon: '🧺' },
    { name: 'EV charging', powerKw: 3.5, durationHours: 3, icon: '🚗' },
];

function bestSolarWindow(hourlyOutput: number[], powerKw: number, durationHours: number) {
    let bestStart = 8;
    let bestSolarEnergy = -1;

    for (let start = 6; start <= 18 - durationHours; start += 1) {
        const solarEnergy = Array.from({ length: durationHours }, (_, offset) =>
            Math.min(hourlyOutput[start + offset] ?? 0, powerKw)
        ).reduce((total, energy) => total + energy, 0);

        if (solarEnergy > bestSolarEnergy) {
            bestSolarEnergy = solarEnergy;
            bestStart = start;
        }
    }

    return {
        start: bestStart,
        solarEnergy: Math.max(0, bestSolarEnergy),
        totalEnergy: powerKw * durationHours,
    };
}

function formatHour(hour: number) {
    return `${String(hour % 12 || 12).padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function SmartLoadShifter({ hourlyOutput, electricityRate }: SmartLoadShifterProps) {
    const recommendations = APPLIANCES.map((appliance) => {
        const window = bestSolarWindow(hourlyOutput, appliance.powerKw, appliance.durationHours);
        const gridEnergy = Math.max(0, window.totalEnergy - window.solarEnergy);
        return {
            ...appliance,
            ...window,
            gridEnergy,
            estimatedSolarValue: window.solarEnergy * electricityRate,
        };
    });

    return (
        <section className="card" aria-labelledby="load-shifter-title" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div className="section-label">Solar-aware scheduling</div>
                    <h2 id="load-shifter-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Smart Appliance Scheduler</h2>
                    <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Suggested windows are calculated from today&apos;s hourly generation forecast.</p>
                </div>
                <span className="badge badge-green">{recommendations.length} suggested schedules</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {recommendations.map((item) => (
                    <article key={item.name} style={{ padding: 14, borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <strong style={{ color: 'var(--t1)' }}>{item.icon} {item.name}</strong>
                            <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>{formatHour(item.start)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8 }}>
                            {item.durationHours} hr · {item.totalEnergy.toFixed(1)} kWh estimated load
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, marginTop: 6 }}>
                            <span style={{ color: 'var(--t2)' }}>Solar covered</span>
                            <span style={{ color: 'var(--t1)' }}>{item.solarEnergy.toFixed(1)} kWh</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, marginTop: 3 }}>
                            <span style={{ color: 'var(--t2)' }}>Grid remainder</span>
                            <span style={{ color: 'var(--amber-bright)' }}>{item.gridEnergy.toFixed(1)} kWh</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 7 }}>
                            Up to ₹{item.estimatedSolarValue.toFixed(0)} solar value at your current tariff
                        </div>
                    </article>
                ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--t3)' }}>Planning estimate only; appliance loads are typical examples and actual usage varies.</p>
        </section>
    );
}
