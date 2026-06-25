'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface SavingsGoalCardProps {
    dailySavings: number;
}

export default function SavingsGoalCard({ dailySavings }: SavingsGoalCardProps) {
    const [monthlyGoal, setMonthlyGoal] = useState(1000);
    const [editing, setEditing] = useState(false);
    const [inputVal, setInputVal] = useState('1000');

    const monthlySavings = dailySavings * 30;
    const annualSavings  = dailySavings * 365;
    const progress = Math.min(100, (monthlySavings / monthlyGoal) * 100);

    // SVG ring
    const r    = 46;
    const circ = 2 * Math.PI * r;
    const dash = (progress / 100) * circ;

    const color =
        progress >= 100 ? '#10b981' :
        progress >= 70  ? '#f59e0b' :
        '#06b6d4';

    const commitGoal = () => {
        const val = parseFloat(inputVal);
        if (val > 0) setMonthlyGoal(val);
        setEditing(false);
    };

    return (
        <div className="glass-card p-5 relative overflow-hidden h-full">
            <div
                className="metric-card-accent"
                style={{ background: 'linear-gradient(90deg, #06b6d4, transparent)' }}
            />
            {/* BG decoration */}
            <div className="absolute right-3 bottom-3 text-7xl opacity-[0.05] pointer-events-none select-none">🎯</div>

            <div className="metric-label mb-4">🎯 Savings Goal Tracker</div>

            <div className="flex items-center gap-5 flex-wrap">
                {/* Circular ring */}
                <div className="relative flex-shrink-0">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                        {/* Track */}
                        <circle
                            cx="55" cy="55" r={r}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="9"
                        />
                        {/* Progress */}
                        <circle
                            cx="55" cy="55" r={r}
                            fill="none"
                            stroke={color}
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ}`}
                            transform="rotate(-90 55 55)"
                            style={{
                                filter: `drop-shadow(0 0 8px ${color}80)`,
                                transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        />
                        {/* Center text */}
                        <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="700"
                            fill={color} fontFamily="'Space Grotesk',sans-serif">
                            {progress.toFixed(0)}%
                        </text>
                        <text x="55" y="66" textAnchor="middle" fontSize="9"
                            fill="rgba(255,255,255,0.35)" fontFamily="Inter,sans-serif">
                            of goal
                        </text>
                    </svg>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3 min-w-[140px]">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                            Monthly Savings
                        </div>
                        <div className="text-xl font-bold font-display" style={{ color }}>
                            {formatCurrency(monthlySavings)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            Annual: {formatCurrency(annualSavings)}
                        </div>
                    </div>

                    {/* Goal editor */}
                    <div>
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Monthly Goal
                        </div>
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>₹</span>
                                <input
                                    type="number"
                                    value={inputVal}
                                    onChange={e => setInputVal(e.target.value)}
                                    onBlur={commitGoal}
                                    onKeyDown={e => e.key === 'Enter' && commitGoal()}
                                    autoFocus
                                    className="w-24 px-2 py-1 rounded-lg text-sm outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(245,158,11,0.4)',
                                        color: 'white',
                                    }}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => { setInputVal(monthlyGoal.toString()); setEditing(true); }}
                                className="text-sm font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-70"
                                style={{ color: '#fbbf24' }}
                            >
                                {formatCurrency(monthlyGoal)}
                                <span className="text-[9px] opacity-50">✏ edit</span>
                            </button>
                        )}
                    </div>

                    {/* Status message */}
                    {progress >= 100 ? (
                        <div className="text-xs font-semibold" style={{ color: '#10b981' }}>🎉 Goal achieved!</div>
                    ) : (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                                {formatCurrency(monthlyGoal - monthlySavings)}
                            </span>{' '}
                            remaining
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
