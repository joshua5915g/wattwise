'use client';

import { useMemo } from 'react';

interface PanelHealthCardProps {
    temperature: number;
    efficiency: number;
    cloudCover: number;
    humidity: number;
    panelCapacity: number;
}

interface SubScore {
    label: string;
    icon: string;
    score: number;
    note: string;
}

function computeHealth(temp: number, efficiency: number, cloud: number, humidity: number) {
    // Temperature: optimal band 18–28°C
    const tempDelta = Math.max(0, Math.abs(temp - 23) - 5);
    const tempScore = Math.max(0, 100 - tempDelta * 3.5);

    // Efficiency: direct  
    const effScore = Math.min(100, efficiency);

    // Solar exposure: inverse of cloud cover
    const solarScore = Math.max(0, 100 - cloud);

    // Humidity: optimal 40–65%
    const humDelta = Math.max(0, Math.abs(humidity - 52.5) - 12.5);
    const humScore = Math.max(0, 100 - humDelta * 1.5);

    // Weighted composite
    const overall = Math.round(
        tempScore * 0.25 +
        effScore  * 0.40 +
        solarScore * 0.25 +
        humScore  * 0.10
    );

    return {
        overall,
        subScores: [
            {
                label: 'Temperature Stress',
                icon: '🌡️',
                score: Math.round(tempScore),
                note: temp > 35 ? 'High heat reduces output' :
                      temp < 15 ? 'Low temp, sub-optimal' : 'Within optimal range',
            },
            {
                label: 'Efficiency',
                icon: '⚡',
                score: Math.round(effScore),
                note: efficiency >= 70 ? 'Excellent conversion' :
                      efficiency >= 40 ? 'Moderate output' : 'Low — check conditions',
            },
            {
                label: 'Solar Exposure',
                icon: '☀️',
                score: Math.round(solarScore),
                note: cloud < 20 ? 'Clear sky — maximum exposure' :
                      cloud < 50 ? 'Partial cloud cover' : 'Heavy cloud obstruction',
            },
            {
                label: 'Humidity Impact',
                icon: '💧',
                score: Math.round(humScore),
                note: humidity > 80 ? 'High moisture reduces irradiance' :
                      humidity < 30 ? 'Very dry — dust accumulation risk' : 'Optimal humidity',
            },
        ] as SubScore[],
    };
}

function getHealthLabel(score: number) {
    if (score >= 80) return { label: 'Excellent', color: '#10b981', emoji: '🟢' };
    if (score >= 60) return { label: 'Good',      color: '#f59e0b', emoji: '🟡' };
    if (score >= 40) return { label: 'Fair',      color: '#f97316', emoji: '🟠' };
    return             { label: 'Poor',       color: '#f87171', emoji: '🔴' };
}

function ScoreBar({ score, color }: { score: number; color: string }) {
    return (
        <div className="progress-bar flex-1">
            <div
                className="progress-fill"
                style={{
                    width: `${score}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 6px ${color}50`,
                }}
            />
        </div>
    );
}

export default function PanelHealthCard({
    temperature, efficiency, cloudCover, humidity, panelCapacity,
}: PanelHealthCardProps) {
    const { overall, subScores } = useMemo(
        () => computeHealth(temperature, efficiency, cloudCover, humidity),
        [temperature, efficiency, cloudCover, humidity]
    );

    const health = getHealthLabel(overall);

    // Arc gauge
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (overall / 100) * circ;

    return (
        <div className="glass-card p-5 relative overflow-hidden">
            <div
                className="metric-card-accent"
                style={{ background: `linear-gradient(90deg, ${health.color}, transparent)` }}
            />
            <div className="absolute right-3 bottom-3 text-7xl opacity-[0.04] pointer-events-none select-none">🔬</div>

            <div className="metric-label mb-4">🔬 Panel Health Score</div>

            <div className="flex gap-5 flex-wrap">
                {/* Gauge */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                        <circle
                            cx="45" cy="45" r={r}
                            fill="none"
                            stroke={health.color}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ}`}
                            transform="rotate(-90 45 45)"
                            style={{
                                filter: `drop-shadow(0 0 6px ${health.color}80)`,
                                transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        />
                        <text x="45" y="41" textAnchor="middle" fontSize="17" fontWeight="700"
                            fill={health.color} fontFamily="'Space Grotesk',sans-serif">
                            {overall}
                        </text>
                        <text x="45" y="56" textAnchor="middle" fontSize="8"
                            fill="rgba(255,255,255,0.35)" fontFamily="Inter,sans-serif">
                            / 100
                        </text>
                    </svg>
                    <div className="text-xs font-bold" style={{ color: health.color }}>
                        {health.emoji} {health.label}
                    </div>
                    <div className="text-[10px] text-center" style={{ color: 'var(--text-secondary)' }}>
                        {panelCapacity} kW system
                    </div>
                </div>

                {/* Sub-scores */}
                <div className="flex-1 space-y-3 min-w-[180px]">
                    {subScores.map((s) => {
                        const c = s.score >= 70 ? '#10b981' : s.score >= 40 ? '#f59e0b' : '#f87171';
                        return (
                            <div key={s.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{s.icon}</span>
                                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold" style={{ color: c }}>
                                        {s.score}
                                    </span>
                                </div>
                                <ScoreBar score={s.score} color={c} />
                                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {s.note}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
