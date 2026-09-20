'use client';

import React, { useState, useEffect } from 'react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenExperiment?: () => void;
}

export default function HowItWorksModal({ isOpen, onClose, onOpenExperiment }: HowItWorksModalProps) {
    const [activeTab, setActiveTab] = useState<'quickstart' | 'features' | 'faq'>('quickstart');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(9, 9, 15, 0.85)',
                backdropFilter: 'blur(12px)',
                animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-xl)',
                    width: '100%',
                    maxWidth: 780,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Accent Line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #3B82F6, #22C55E, #F59E0B)',
                    }}
                />

                {/* Modal Header */}
                <div
                    style={{
                        padding: '24px 28px 18px',
                        borderBottom: '1px solid var(--b1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,197,94,0.1))',
                                border: '1px solid rgba(59,130,246,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                            }}
                        >
                            ⚡
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--t1)' }}>
                                Welcome to WattWise
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>
                                Your AI-Powered Solar Forecasting & Energy Optimization Guide
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--b3)',
                            border: '1px solid var(--b1)',
                            color: 'var(--t2)',
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 16,
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--t1)';
                            e.currentTarget.style.background = 'var(--raised)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--t2)';
                            e.currentTarget.style.background = 'var(--b3)';
                        }}
                        title="Close Guide"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        padding: '12px 28px',
                        borderBottom: '1px solid var(--b1)',
                        background: 'var(--raised)',
                    }}
                >
                    {[
                        { id: 'quickstart', label: '🚀 3-Step Quickstart' },
                        { id: 'features', label: '⚡ What the Tools Do' },
                        { id: 'faq', label: '❓ FAQ & Tips' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                color: activeTab === tab.id ? 'var(--t1)' : 'var(--t2)',
                                background: activeTab === tab.id ? 'var(--overlay)' : 'transparent',
                                border: activeTab === tab.id ? '1px solid var(--b2)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* TAB 1: QUICKSTART */}
                    {activeTab === 'quickstart' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: 10,
                                    background: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <span style={{ fontSize: 20 }}>💡</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-bright)', marginBottom: 2 }}>
                                        What is the core goal of WattWise?
                                    </div>
                                    <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
                                        Most rooftop solar owners lose money because they do not know exactly when their panels will generate maximum power. WattWise predicts your generation curve in advance and guides you to run heavy appliances when power is 100% free!
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
                                {/* Step 1 */}
                                <div
                                    style={{
                                        background: 'var(--raised)',
                                        border: '1px solid var(--b1)',
                                        borderRadius: 12,
                                        padding: '18px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: 'var(--blue-dim)',
                                            color: 'var(--blue-bright)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        1
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
                                        Select City & System
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                                        Pick your city from 60+ Indian locations and specify your rooftop panel capacity (e.g., 3 kW, 5 kW, or 10 kW).
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div
                                    style={{
                                        background: 'var(--raised)',
                                        border: '1px solid var(--b1)',
                                        borderRadius: 12,
                                        padding: '18px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: 'var(--amber-dim)',
                                            color: 'var(--amber-bright)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        2
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
                                        Check Peak Hours
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                                        Inspect the 24-hour generation curve to identify your peak generation window (typically 11:00 AM – 3:00 PM).
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div
                                    style={{
                                        background: 'var(--raised)',
                                        border: '1px solid var(--b1)',
                                        borderRadius: 12,
                                        padding: '18px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: 'var(--green-dim)',
                                            color: 'var(--green-bright)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        3
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
                                        Shift Heavy Loads
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                                        Follow the AI Energy Advisor advice to run ACs, washing machines, or charge batteries during peak output.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: FEATURES */}
                    {activeTab === 'features' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                            {[
                                {
                                    icon: '📈',
                                    title: '24-Hour ML Solar Curve',
                                    desc: 'Predicts exact hourly generation (kWh/hour) accounting for solar irradiance, cloud cover, and ambient temperature.',
                                },
                                {
                                    icon: '💰',
                                    title: 'Financial Savings & ROI',
                                    desc: 'Calculates real-time money saved today (₹) based on local grid electricity tariffs, plus monthly and annual projections.',
                                },
                                {
                                    icon: '🤖',
                                    title: 'AI Energy Advisor',
                                    desc: 'Recommends optimal time windows for high-draw appliances (Washing machine, Dishwasher, EV charging, Geysers).',
                                },
                                {
                                    icon: '🔋',
                                    title: 'Battery Storage Dispatch',
                                    desc: 'Advises when to charge your home battery from solar vs. when to discharge to avoid peak grid rates.',
                                },
                                {
                                    icon: '🩺',
                                    title: 'Panel Health & Diagnostics',
                                    desc: 'Monitors thermal losses, cloud attenuation, and inverter clipping to detect maintenance or cleaning needs.',
                                },
                                {
                                    icon: '🧪',
                                    title: 'Weather Experiment Lab',
                                    desc: 'Simulate extreme summer heatwaves, heavy monsoon clouds, or winter smog to see how your solar output responds.',
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    style={{
                                        background: 'var(--raised)',
                                        border: '1px solid var(--b1)',
                                        borderRadius: 12,
                                        padding: '16px',
                                        display: 'flex',
                                        gap: 12,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                                            {f.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                                            {f.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB 3: FAQ */}
                    {activeTab === 'faq' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                {
                                    q: 'What if I do not own solar panels yet?',
                                    a: 'WattWise acts as a realistic solar calculator. You can select your city and different system sizes (e.g. 3 kW or 5 kW) to see how much energy and money you would save before buying.',
                                },
                                {
                                    q: 'How are the Rupee (₹) savings calculated?',
                                    a: 'Savings = (Daily Solar Output in kWh) × (Electricity Tariff per kWh). You can adjust the electricity unit rate in the controls to match your state electricity board bill.',
                                },
                                {
                                    q: 'What is the Solar Score (0 - 100)?',
                                    a: 'The Solar Score represents real-time solar generation conditions based on solar irradiance, cloud thickness, humidity, and temperature efficiency.',
                                },
                                {
                                    q: 'How often does live weather update?',
                                    a: 'Live weather telemetry refreshes in real-time for 60+ Indian cities across all states and union territories.',
                                },
                            ].map((faq, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--raised)',
                                        border: '1px solid var(--b1)',
                                        borderRadius: 10,
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                                        {faq.q}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                                        {faq.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        padding: '16px 28px',
                        borderTop: '1px solid var(--b1)',
                        background: 'var(--raised)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                        Press <kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--overlay)', border: '1px solid var(--b2)', fontSize: 10, color: 'var(--t2)' }}>ESC</kbd> to exit guide
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {onOpenExperiment && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onOpenExperiment();
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    background: 'var(--b3)',
                                    border: '1px solid var(--b1)',
                                    color: 'var(--t1)',
                                    cursor: 'pointer',
                                }}
                            >
                                🧪 Try Experiment Mode
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                background: 'var(--blue)',
                                border: 'none',
                                color: '#ffffff',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                            }}
                        >
                            Got it, Explore Dashboard →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
