'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { FinancialResult } from '@/lib/types';

interface SolarFinancialCalculatorProps {
    defaultCapacityKw: number;
    defaultRate: number;
    dailyGenerationKwh: number;
}

export default function SolarFinancialCalculator({
    defaultCapacityKw,
    defaultRate,
    dailyGenerationKwh
}: SolarFinancialCalculatorProps) {
    const [capacityKw, setCapacityKw] = useState<number>(defaultCapacityKw || 3);
    const [costPerWatt, setCostPerWatt] = useState<number>(55); // ₹55/W average in India
    const [elecRate, setElecRate] = useState<number>(defaultRate || 8);
    const [scheme, setScheme] = useState<'pm_surya_ghar' | 'commercial' | 'none'>('pm_surya_ghar');
    const [touPeakHours, setTouPeakHours] = useState<boolean>(true); // Time of Use peak tariff

    const calculations = useMemo<FinancialResult>(() => {
        const gross = capacityKw * 1000 * costPerWatt;
        let subsidy = 0;

        if (scheme === 'pm_surya_ghar') {
            // PM Surya Ghar Muft Bijli Yojana Official Rules
            if (capacityKw <= 1) {
                subsidy = 30000;
            } else if (capacityKw <= 2) {
                subsidy = 60000;
            } else {
                subsidy = 78000; // Capped at ₹78,000 for 3kW and above
            }
        } else if (scheme === 'commercial') {
            // Accelerated depreciation tax benefit approx 20% effective tax shield
            subsidy = gross * 0.20;
        }

        const netCost = Math.max(0, gross - subsidy);

        // Daily yield estimation scaled to capacity
        const dailyKwh = dailyGenerationKwh > 0 ? (dailyGenerationKwh / (defaultCapacityKw || 1)) * capacityKw : capacityKw * 4.4;
        const effectiveRate = touPeakHours ? elecRate * 1.15 : elecRate;
        const annualSavingsY1 = dailyKwh * 365 * effectiveRate;

        // 25 year cash flow model
        let cumulativeSavings = 0;
        let paybackYears = 0;
        let costRecovered = false;

        for (let year = 1; year <= 25; year++) {
            const degradation = Math.pow(1 - 0.007, year - 1); // 0.7% annual degradation
            const tariffInflation = Math.pow(1 + 0.03, year - 1); // 3% tariff increase
            const yearSavings = dailyKwh * 365 * degradation * effectiveRate * tariffInflation;

            cumulativeSavings += yearSavings;

            if (!costRecovered && cumulativeSavings >= netCost) {
                const prevSavings = cumulativeSavings - yearSavings;
                const frac = (netCost - prevSavings) / yearSavings;
                paybackYears = +(year - 1 + frac).toFixed(1);
                costRecovered = true;
            }
        }

        if (!costRecovered) {
            paybackYears = 25;
        }

        const total25YrNetProfit = cumulativeSavings - netCost;
        const roiPercent = netCost > 0 ? Math.round((total25YrNetProfit / netCost) * 100) : 999;
        const co2LifetimeTons = +(dailyKwh * 365 * 25 * 0.82 / 1000).toFixed(1);

        return {
            grossCost: gross,
            subsidyAmount: subsidy,
            netCost,
            annualSavingsYear1: annualSavingsY1,
            paybackYears,
            twentyFiveYearSavings: total25YrNetProfit,
            roiPercent,
            co2LifetimeTons,
        };
    }, [capacityKw, costPerWatt, elecRate, scheme, touPeakHours, dailyGenerationKwh, defaultCapacityKw]);

    return (
        <div id="calculator" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>💰</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Solar Financial, ROI & PM Surya Ghar Subsidy Calculator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Comprehensive 25-year financial modeling with government subsidies, payback period, and net-metering cashflow
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: 'var(--raised)', padding: 4, borderRadius: 8, border: '1px solid var(--b1)' }}>
                    <button
                        onClick={() => setScheme('pm_surya_ghar')}
                        style={{
                            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: scheme === 'pm_surya_ghar' ? 'var(--blue)' : 'transparent',
                            color: scheme === 'pm_surya_ghar' ? '#fff' : 'var(--t2)',
                        }}
                    >
                        PM Surya Ghar Subsidy
                    </button>
                    <button
                        onClick={() => setScheme('commercial')}
                        style={{
                            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: scheme === 'commercial' ? 'var(--blue)' : 'transparent',
                            color: scheme === 'commercial' ? '#fff' : 'var(--t2)',
                        }}
                    >
                        Commercial (Tax Dep.)
                    </button>
                    <button
                        onClick={() => setScheme('none')}
                        style={{
                            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: scheme === 'none' ? 'var(--blue)' : 'transparent',
                            color: scheme === 'none' ? '#fff' : 'var(--t2)',
                        }}
                    >
                        No Subsidy
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                <div style={{ background: 'var(--raised)', padding: '14px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Net Capital Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>
                        {formatCurrency(calculations.netCost)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green-bright)', marginTop: 2 }}>
                        {calculations.subsidyAmount > 0 ? `Saved ₹${(calculations.subsidyAmount / 1000).toFixed(0)}k via subsidy` : 'Standard CapEx'}
                    </div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Payback Period</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: calculations.paybackYears <= 4 ? 'var(--green-bright)' : 'var(--amber-bright)', marginTop: 2 }}>
                        {calculations.paybackYears} <span style={{ fontSize: 13, fontWeight: 500 }}>Years</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>100% Free Power Thereafter</div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>25-Year Net Profit</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                        {formatCurrency(calculations.twentyFiveYearSavings)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--blue-bright)', marginTop: 2 }}>{calculations.roiPercent}% Return on Invest</div>
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Annual Year 1 Savings</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 2 }}>
                        {formatCurrency(calculations.annualSavingsYear1)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>≈ ₹{(calculations.annualSavingsYear1 / 12).toFixed(0)}/month</div>
                </div>
            </div>

            {/* Interactive Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>System Capacity:</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>{capacityKw} kW</span>
                    </div>
                    <input
                        type="range" min="1" max="15" step="0.5"
                        value={capacityKw}
                        onChange={e => setCapacityKw(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>1 kW (100 sq ft)</span>
                        <span>3 kW (Ideal 2BHK)</span>
                        <span>10+ kW</span>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Turnkey Cost per Watt:</span>
                        <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>₹{costPerWatt}/W</span>
                    </div>
                    <input
                        type="range" min="40" max="80" step="1"
                        value={costPerWatt}
                        onChange={e => setCostPerWatt(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>₹40/W (Polycrystalline)</span>
                        <span>₹55/W (Mono PERC)</span>
                        <span>₹80/W (Bifacial/Micro)</span>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Grid Tariff Rate:</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-bright)' }}>₹{elecRate}/kWh</span>
                    </div>
                    <input
                        type="range" min="4" max="16" step="0.5"
                        value={elecRate}
                        onChange={e => setElecRate(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <input
                            type="checkbox"
                            checked={touPeakHours}
                            onChange={() => setTouPeakHours(!touPeakHours)}
                            style={{ accentColor: 'var(--green-bright)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--t2)' }}>Include Time-of-Use Peak Hour Premium (+15%)</span>
                    </div>
                </div>
            </div>

            {/* 25-Year Cumulative Progression Bar */}
            <div style={{ background: 'var(--raised)', padding: '16px 20px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: 'var(--t1)' }}>25-Year Financial Horizon & Breakeven Milestone</span>
                    <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>Breakeven @ Year {calculations.paybackYears}</span>
                </div>

                <div style={{ width: '100%', height: 16, background: 'var(--surface)', borderRadius: 99, display: 'flex', overflow: 'hidden', border: '1px solid var(--b2)' }}>
                    <div
                        style={{
                            width: `${(calculations.paybackYears / 25) * 100}%`,
                            background: 'var(--amber)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: '#000',
                            transition: 'width 0.3s ease'
                        }}
                        title="CapEx Payback Window"
                    >
                        Payback
                    </div>
                    <div
                        style={{
                            flex: 1,
                            background: 'linear-gradient(90deg, #22C55E 0%, #3B82F6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: '#000'
                        }}
                        title="Pure Profit Years"
                    >
                        100% Free Solar Electricity ({25 - Math.ceil(calculations.paybackYears)} Years)
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
                    <span>Day 0 (Installation)</span>
                    <span>Year 5</span>
                    <span>Year 10</span>
                    <span>Year 15</span>
                    <span>Year 20</span>
                    <span>Year 25 (End of Warranty)</span>
                </div>
            </div>
        </div>
    );
}
