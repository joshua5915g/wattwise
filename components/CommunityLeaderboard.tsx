'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface CommunityLeaderboardProps {
    panelKw: number;
    dailyKwh: number;
    location: string;
}

interface Badge {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: string;
    tier: 'Gold' | 'Diamond' | 'Platinum' | 'Silver';
}

const BADGES: Badge[] = [
    { id: 'mwh', title: '1 Megawatt-Hour Club', description: 'Generated >1,000 kWh of total solar energy', icon: '⚡', unlocked: true, tier: 'Gold' },
    { id: 'zerogrid', title: 'Zero-Grid Master', description: 'Achieved 100% self-sufficiency for 7 consecutive days', icon: '🛡️', unlocked: true, tier: 'Diamond' },
    { id: 'cleanair', title: 'Clean Air Hero', description: 'Avoided over 1,200 kg of carbon dioxide emissions', icon: '🌳', unlocked: true, tier: 'Platinum' },
    { id: 'efficiency', title: 'Solar Optimizer', description: 'Maintained system efficiency rating above 85%', icon: '🏅', unlocked: true, tier: 'Gold' },
    { id: 'export', title: 'Grid Philanthropist', description: 'Exported >500 kWh clean electricity to DISCOM grid', icon: '🌐', unlocked: false, progress: '380 / 500 kWh (76%)', tier: 'Silver' },
];

export default function CommunityLeaderboard({ panelKw, dailyKwh, location }: CommunityLeaderboardProps) {
    const city = location.split(',')[0];
    const peerOutperformance = 18; // 18% higher than local average

    return (
        <div id="community" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🏆</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Neighborhood Solar Benchmark & Eco Badges
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Compare your rooftop solar performance with local peer installations in {city} and unlock milestones
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-green">
                        🏅 Top 8% Clean Energy Producer in {city}
                    </span>
                </div>
            </div>

            {/* Neighborhood Benchmark Hero Grid */}
            <div style={{
                background: 'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, rgba(9,9,15,0.95) 75%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Community Benchmark</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--amber-bright)', marginTop: 2 }}>
                        +{peerOutperformance}% Ahead
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                        Your rooftop generates 18% more clean kWh than the average {city} solar installation
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Your Daily Average</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                        {dailyKwh > 0 ? dailyKwh.toFixed(1) : (panelKw * 4.4).toFixed(1)} <span style={{ fontSize: 12, fontWeight: 500 }}>kWh/day</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Vs {(panelKw * 3.7).toFixed(1)} kWh city average</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>City Leaderboard Rank</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                        #14 <span style={{ fontSize: 12, fontWeight: 500 }}>of 340 homes</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green-bright)', marginTop: 2 }}>Tier 1 Eco Champion</div>
                </div>
            </div>

            {/* Achievement Badges Collection */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>
                    Unlocked Eco Milestones & Badges
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {BADGES.map(badge => (
                        <div
                            key={badge.id}
                            style={{
                                background: badge.unlocked ? 'var(--raised)' : 'var(--surface)',
                                border: badge.unlocked ? '1px solid var(--b2)' : '1px solid var(--b1)',
                                borderRadius: 'var(--r)',
                                padding: '14px 16px',
                                opacity: badge.unlocked ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                transition: 'transform 0.15s ease'
                            }}
                        >
                            <span style={{ fontSize: 28, filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>{badge.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{badge.title}</span>
                                    {badge.unlocked && <span className="badge badge-amber" style={{ fontSize: 9, padding: '1px 5px' }}>{badge.tier}</span>}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--t2)' }}>{badge.description}</div>
                                {!badge.unlocked && badge.progress && (
                                    <div style={{ fontSize: 10, color: 'var(--blue-bright)', fontWeight: 600, marginTop: 4 }}>
                                        Progress: {badge.progress}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
