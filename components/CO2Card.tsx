'use client';

import { useEffect, useRef, useState } from 'react';

interface CO2CardProps {
    dailyOutputKwh: number;
}

function useCountUp(target: number, duration = 800) {
    const [value, setValue] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        const start = prev.current;
        const startTime = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(start + (target - start) * eased);
            if (t < 1) requestAnimationFrame(tick);
            else prev.current = target;
        };
        requestAnimationFrame(tick);
    }, [target, duration]);

    return value;
}

export default function CO2Card({ dailyOutputKwh }: CO2CardProps) {
    // 0.82 kg CO2 per kWh (India grid average)
    const co2Saved = dailyOutputKwh * 0.82;
    // One tree absorbs ~21 kg CO2/year → per day = 0.0575
    const treesEquiv = co2Saved / 0.0575;
    // Monthly extrapolation
    const monthlyCo2 = co2Saved * 30;

    const displayedCo2 = useCountUp(co2Saved, 800);
    const displayedTrees = useCountUp(treesEquiv, 900);

    return (
        <div className="glass-card p-5 relative overflow-hidden">
            <div className="metric-card-accent" style={{ background: 'linear-gradient(90deg, #10b981, transparent)' }} />

            {/* Background icon */}
            <div
                className="absolute right-4 bottom-2 text-7xl opacity-[0.06] select-none pointer-events-none"
                style={{ filter: 'grayscale(0)' }}
            >
                🌱
            </div>

            <div className="metric-label mb-3">🌱 CO₂ Avoided</div>

            <div className="space-y-4">
                {/* Main metric */}
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="metric-value" style={{ color: '#34d399', textShadow: '0 0 20px rgba(16,185,129,0.4)', fontSize: '2rem' }}>
                            {displayedCo2.toFixed(2)}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>kg today</span>
                    </div>
                    <div className="metric-delta">≈ {monthlyCo2.toFixed(1)} kg / month</div>
                </div>

                <div className="divider" />

                {/* Trees equivalent */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Tree Equivalent</div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-display" style={{ color: '#34d399' }}>
                                {displayedTrees.toFixed(1)}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>trees/day</span>
                        </div>
                    </div>
                    <div className="flex gap-0.5 flex-wrap justify-end max-w-[80px]">
                        {Array.from({ length: Math.min(Math.round(treesEquiv), 12) }).map((_, i) => (
                            <span key={i} className="text-lg leading-none">🌳</span>
                        ))}
                        {Math.round(treesEquiv) > 12 && (
                            <span className="text-[10px] text-emerald-400">+{Math.round(treesEquiv) - 12}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
