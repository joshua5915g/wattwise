'use client';

import { useEffect, useRef, useState } from 'react';

interface SolarGaugeProps {
    score: number; // 0–100
    label?: string;
}

function getGaugeColor(score: number) {
    if (score >= 70) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.5)', text: '#34d399', label: 'Excellent' };
    if (score >= 40) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.5)', text: '#fbbf24', label: 'Good' };
    return { stroke: '#f87171', glow: 'rgba(248,113,113,0.4)', text: '#fca5a5', label: 'Low' };
}

export default function SolarGauge({ score, label = 'Solar Score' }: SolarGaugeProps) {
    const [displayed, setDisplayed] = useState(0);
    const prevScore = useRef(0);

    useEffect(() => {
        const start = prevScore.current;
        const end = score;
        const duration = 800;
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
            else prevScore.current = end;
        };

        requestAnimationFrame(animate);
    }, [score]);

    const colors = getGaugeColor(score);

    // SVG arc math
    const size = 160;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const r = 60;
    const startAngle = -210; // degrees
    const totalAngle = 240;  // degrees span
    const progressAngle = (displayed / 100) * totalAngle;

    function polarToCartesian(angle: number) {
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad),
        };
    }

    function arcPath(startDeg: number, endDeg: number) {
        const start = polarToCartesian(startDeg);
        const end = polarToCartesian(endDeg);
        const largeArc = endDeg - startDeg > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    }

    const bgPath = arcPath(startAngle, startAngle + totalAngle);
    const fillPath = displayed > 0 ? arcPath(startAngle, startAngle + progressAngle) : '';

    // Zone markers
    const zones = [
        { angle: startAngle + totalAngle * 0.4, color: '#f59e0b' },
        { angle: startAngle + totalAngle * 0.7, color: '#10b981' },
    ];

    return (
        <div className="glass-card p-5 flex flex-col items-center justify-center relative">
            <div className="metric-card-accent" style={{ background: `linear-gradient(90deg, ${colors.stroke}, transparent)` }} />
            <div className="metric-label mb-3">{label}</div>

            <div className="relative" style={{ width: size, height: size * 0.8 }}>
                <svg width={size} height={size * 0.9} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background track */}
                    <path
                        d={bgPath}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    {/* Glow filter */}
                    <defs>
                        <filter id="gauge-glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Progress arc */}
                    {fillPath && (
                        <path
                            d={fillPath}
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="10"
                            strokeLinecap="round"
                            filter="url(#gauge-glow)"
                            style={{ transition: 'none' }}
                        />
                    )}
                    {/* Zone markers */}
                    {zones.map((z, i) => {
                        const pt = polarToCartesian(z.angle);
                        return (
                            <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={z.color} opacity="0.6" />
                        );
                    })}
                    {/* Center score */}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="700"
                        fill={colors.text} fontFamily="'Space Grotesk', sans-serif"
                        style={{ textShadow: `0 0 20px ${colors.glow}` }}>
                        {displayed}
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)"
                        fontFamily="Inter, sans-serif" fontWeight="500">
                        / 100
                    </text>
                </svg>
            </div>

            <div className="mt-1 text-center">
                <div className="text-sm font-semibold" style={{ color: colors.text }}>{colors.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Today&apos;s potential</div>
            </div>
        </div>
    );
}
