'use client';

import { useEffect, useRef, useState } from 'react';
import SparklineChart from './SparklineChart';

interface MetricCardProps {
    label: string;
    value: string;
    delta?: string;
    status?: string;
    color?: string;
    statusClass?: string;
    accentColor?: string;
    className?: string;
    staggerIndex?: number;
    trend?: number[];
    trendLabel?: string;
    deltaUp?: boolean | null; // true = up (green), false = down (red), null = neutral
}

export default function MetricCard({
    label,
    value,
    delta,
    status,
    color = 'var(--blue)',
    statusClass,
    accentColor,
    staggerIndex = 0,
    trend,
    trendLabel,
    deltaUp,
}: MetricCardProps) {
    const [flash, setFlash] = useState(false);
    const prev = useRef(value);

    useEffect(() => {
        if (prev.current !== value) {
            setFlash(true);
            const t = setTimeout(() => setFlash(false), 300);
            prev.current = value;
            return () => clearTimeout(t);
        }
    }, [value]);

    const accent = accentColor || color;
    const delay  = staggerIndex * 0.05;

    return (
        <div
            className="card"
            style={{
                padding: '18px 20px',
                animation: `enter 0.25s ${delay}s ease both`,
                display: 'flex', flexDirection: 'column', gap: 0,
                /* NO overflow:hidden */
            }}
        >
            {/* Accent top line */}
            <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%',
                height: 1, background: accent, borderRadius: 99,
                opacity: 0.5,
            }} />

            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="metric-label">{label}</div>
                {status && (
                    <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                        textTransform: 'uppercase', color: accent,
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />
                        {status}
                    </span>
                )}
            </div>

            {/* Value */}
            <div
                className={`metric-value ${statusClass || ''} ${flash ? 'value-update' : ''}`}
                style={{ color: accent, fontSize: '1.75rem' }}
            >
                {value}
            </div>

            {/* Delta */}
            {delta && (
                <div className="metric-delta" style={{
                    display: 'flex', alignItems: 'center', gap: 5, marginTop: 6,
                }}>
                    {deltaUp !== null && deltaUp !== undefined && (
                        <span style={{ color: deltaUp ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                            {deltaUp ? '▲' : '▼'}
                        </span>
                    )}
                    {delta}
                </div>
            )}

            {/* Sparkline */}
            {trend && trend.length >= 2 && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--b1)' }}>
                    {trendLabel && (
                        <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {trendLabel}
                        </div>
                    )}
                    <SparklineChart data={trend} color={accent} width={140} height={32} />
                </div>
            )}
        </div>
    );
}
