'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WelcomeGuideBannerProps {
    onOpenGuide: () => void;
}

const STORAGE_KEY = 'wattwise_guide_banner_dismissed_v1';

export default function WelcomeGuideBanner({ onOpenGuide }: WelcomeGuideBannerProps) {
    const [dismissed, setDismissed] = useState<boolean>(true);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
        const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
        setDismissed(isDismissed);
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    if (!mounted || dismissed) return null;

    return (
        <div
            className="stagger-1"
            style={{
                position: 'relative',
                borderRadius: 'var(--r-xl)',
                background: 'linear-gradient(135deg, rgba(22, 22, 31, 0.95), rgba(15, 15, 23, 0.9))',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35), 0 0 24px rgba(59, 130, 246, 0.08)',
                padding: '20px 24px',
                overflow: 'hidden',
            }}
        >
            {/* Top gradient glow line */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #3B82F6, #22C55E, transparent)',
                }}
            />

            {/* Background watermark icon */}
            <div
                style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 100,
                    opacity: 0.04,
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                ☀️
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2 }}>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 10px',
                                borderRadius: 20,
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.35)',
                                color: 'var(--blue-bright)',
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            }}
                        >
                            <span>👋</span> What is WattWise?
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--t3)' }}>•</span>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>
                            Solar Energy & Financial Intelligence Platform
                        </span>
                    </div>

                    <button
                        onClick={handleDismiss}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--t3)',
                            fontSize: 12,
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: 6,
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}
                        title="Dismiss banner"
                    >
                        Dismiss ✕
                    </button>
                </div>

                {/* Main Content & Purpose */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                            Maximize your rooftop solar savings with AI forecasting.
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6, lineHeight: 1.5 }}>
                            WattWise predicts your 24-hour solar generation in real-time, estimates daily & annual rupee (₹) savings, and tells you the exact best hours to run heavy home appliances for free solar power.
                        </p>
                    </div>

                    {/* Quick 3-Pillar Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { icon: '🔮', label: 'ML Solar Output Forecast', sub: 'Calculated hourly for 60+ Indian cities' },
                            { icon: '💰', label: 'Live Financial ROI & Savings', sub: 'Real-time daily, monthly & annual ₹ estimates' },
                            { icon: '🤖', label: 'AI Appliance Load Scheduling', sub: 'Optimal hours for AC, Washing Machine, & EV' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: 'var(--surface)',
                                    border: '1px solid var(--b1)',
                                }}
                            >
                                <span style={{ fontSize: 15 }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{item.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{item.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        paddingTop: 12,
                        borderTop: '1px solid var(--b1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            onClick={onOpenGuide}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '7px 16px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                background: 'var(--blue)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                            📖 View Quick Guide & How It Works
                        </button>

                        <Link
                            href="/experiment"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 14px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                background: 'var(--surface)',
                                border: '1px solid var(--b2)',
                                color: 'var(--t2)',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--t1)';
                                e.currentTarget.style.borderColor = 'var(--amber)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--t2)';
                                e.currentTarget.style.borderColor = 'var(--b2)';
                            }}
                        >
                            🧪 Simulate Custom Weather →
                        </Link>
                    </div>

                    <button
                        onClick={handleDismiss}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: 'transparent',
                            border: '1px solid var(--b1)',
                            color: 'var(--t2)',
                            cursor: 'pointer',
                        }}
                    >
                        Got it, take me to dashboard ✓
                    </button>
                </div>
            </div>
        </div>
    );
}
