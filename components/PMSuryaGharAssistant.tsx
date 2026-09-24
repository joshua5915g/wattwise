'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

export type StateSubsidy = 'up' | 'gujarat' | 'delhi' | 'maharashtra' | 'karnataka' | 'tamilnadu' | 'none';

interface StateSubInfo {
    name: string;
    topUpAmount: number; // additional state subsidy
    note: string;
}

const STATE_TOPUPS: Record<StateSubsidy, StateSubInfo> = {
    up: { name: 'Uttar Pradesh (UPNEDA)', topUpAmount: 30000, note: 'UP state top-up adds ₹15,000/kW up to ₹30,000 for residential systems.' },
    gujarat: { name: 'Gujarat (Surya Gujarat)', topUpAmount: 20000, note: 'Direct DISCOM credit top-up through GUVNL portal.' },
    delhi: { name: 'Delhi (Delhi Solar Policy)', topUpAmount: 15000, note: 'Additional GBI (Generation Based Incentive) of ₹2.00/kWh for 5 years.' },
    maharashtra: { name: 'Maharashtra (MEDA)', topUpAmount: 0, note: 'Standard Central PM Surya Ghar DBT without separate state pool.' },
    karnataka: { name: 'Karnataka (KREDL)', topUpAmount: 0, note: 'Standard Central PM Surya Ghar DBT with simplified single-window BESCOM NOC.' },
    tamilnadu: { name: 'Tamil Nadu (TEDA)', topUpAmount: 0, note: 'Central PM Surya Ghar with 100-unit bi-monthly domestic free tier.' },
    none: { name: 'Other State / Union Territory', topUpAmount: 0, note: 'Standard Central Government DBT subsidy.' }
};

interface PMSuryaGharAssistantProps {
    defaultCapacityKw: number;
    currentRate: number;
}

export default function PMSuryaGharAssistant({
    defaultCapacityKw,
    currentRate
}: PMSuryaGharAssistantProps) {
    const [systemKw, setSystemKw] = useState<number>(defaultCapacityKw || 3);
    const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(4);
    const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(350);
    const [stateChoice, setStateChoice] = useState<StateSubsidy>('up');

    // Interactive Application Checklist
    const [checklist, setChecklist] = useState({
        docElectricityBill: true,
        docAadhaarBankLinked: true,
        docRoofOwnership: true,
        portalRegistered: false,
        discomNocIssued: false,
        vendorSelected: false,
        netMeterInstalled: false,
    });

    const stateInfo = STATE_TOPUPS[stateChoice];

    // Feasibility and Financial Math
    const math = useMemo(() => {
        // Area required: ~100 sq ft per 1 kW
        const areaRequired = systemKw * 100;
        const isAreaFeasible = roofAreaSqFt >= areaRequired;

        // Sanctioned load check: Solar capacity should not exceed sanctioned load in most DISCOMs
        const isLoadFeasible = systemKw <= sanctionedLoadKw;

        // Central DBT Subsidy Formula
        let centralDbt = 0;
        if (systemKw <= 1) {
            centralDbt = 30000;
        } else if (systemKw <= 2) {
            centralDbt = 60000;
        } else {
            centralDbt = 78000; // Capped at ₹78,000 for 3 kW and higher
        }

        // State Top-up
        const stateTopUp = systemKw >= 2 ? stateInfo.topUpAmount : stateInfo.topUpAmount * 0.5;
        const totalSubsidy = centralDbt + stateTopUp;

        // Estimated Gross Turnkey Cost (avg ₹55,000 / kW in India for ALMM DCR modules)
        const grossCost = systemKw * 55000;
        const netConsumerCost = Math.max(0, grossCost - totalSubsidy);

        // Daily Generation ~ 4.3 kWh/kW/day in India
        const annualGenerationKwh = Math.round(systemKw * 4.3 * 365);
        const annualSavingsInr = Math.round(annualGenerationKwh * currentRate);
        const paybackYears = +(netConsumerCost / Math.max(1, annualSavingsInr)).toFixed(1);

        return {
            areaRequired,
            isAreaFeasible,
            isLoadFeasible,
            centralDbt,
            stateTopUp,
            totalSubsidy,
            grossCost,
            netConsumerCost,
            annualGenerationKwh,
            annualSavingsInr,
            paybackYears
        };
    }, [systemKw, sanctionedLoadKw, roofAreaSqFt, stateInfo, currentRate]);

    const toggleStep = (key: keyof typeof checklist) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const completedStepsCount = Object.values(checklist).filter(Boolean).length;
    const progressPercent = Math.round((completedStepsCount / 7) * 100);

    return (
        <div id="pm-surya-ghar" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🏛️</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber-bright)' }}>
                            PM Surya Ghar: Muft Bijli Yojana Application Kit & Subsidy Navigator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Official Ministry of New & Renewable Energy (MNRE) subsidy calculator, sanctioned load checker, and National Portal roadmap
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-amber" style={{ fontSize: 12 }}>
                        🏛️ Max ₹{math.totalSubsidy.toLocaleString()} Total Subsidy
                    </span>
                    <span className="badge badge-green">
                        {progressPercent}% Ready to Apply
                    </span>
                </div>
            </div>

            {/* Input Configuration Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                {/* 1. Proposed Solar Capacity */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Target Solar Capacity:</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--amber-bright)' }}>
                            {systemKw} kW
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {[1, 2, 3, 5].map(kw => (
                            <button
                                key={kw}
                                onClick={() => setSystemKw(kw)}
                                style={{
                                    padding: '6px 4px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: systemKw === kw ? 'var(--amber)' : 'var(--surface)',
                                    color: systemKw === kw ? '#000' : 'var(--t2)'
                                }}
                            >
                                {kw} kW
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>
                        {systemKw >= 3 ? '✓ Eligible for maximum ₹78,000 Central DBT cap' : `₹${systemKw * 30000} Central DBT tier`}
                    </div>
                </div>

                {/* 2. Sanctioned Grid Load */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Electricity Sanctioned Load:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: math.isLoadFeasible ? 'var(--green-bright)' : '#F87171' }}>
                            {sanctionedLoadKw} kW
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={sanctionedLoadKw}
                        onChange={e => setSanctionedLoadKw(Number(e.target.value))}
                        style={{ width: '100%', accentColor: math.isLoadFeasible ? 'var(--green-bright)' : '#F87171' }}
                    />
                    <div style={{ fontSize: 10, color: math.isLoadFeasible ? 'var(--green-bright)' : '#F87171', marginTop: 4 }}>
                        {math.isLoadFeasible ? '✓ Sanctioned load accommodates solar capacity' : '⚠️ Need DISCOM load enhancement before applying'}
                    </div>
                </div>

                {/* 3. Shadow-Free Roof Area */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Shadow-Free Roof Area:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: math.isAreaFeasible ? 'var(--blue-bright)' : '#F87171' }}>
                            {roofAreaSqFt} sq.ft
                        </span>
                    </div>
                    <input
                        type="range"
                        min="80"
                        max="1200"
                        step="20"
                        value={roofAreaSqFt}
                        onChange={e => setRoofAreaSqFt(Number(e.target.value))}
                        style={{ width: '100%', accentColor: math.isAreaFeasible ? 'var(--blue)' : '#F87171' }}
                    />
                    <div style={{ fontSize: 10, color: math.isAreaFeasible ? 'var(--t3)' : '#F87171', marginTop: 4 }}>
                        Requires {math.areaRequired} sq.ft for {systemKw} kW array ({math.isAreaFeasible ? 'Sufficient' : 'Roof too small'})
                    </div>
                </div>

                {/* 4. State Top-up Subsidy */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
                        State Additional Subsidy Pool:
                    </div>
                    <select
                        value={stateChoice}
                        onChange={e => setStateChoice(e.target.value as StateSubsidy)}
                        style={{
                            width: '100%',
                            background: 'var(--surface)',
                            border: '1px solid var(--b2)',
                            borderRadius: 6,
                            padding: '8px 10px',
                            color: 'var(--t1)',
                            fontSize: 12,
                            outline: 'none'
                        }}
                    >
                        {(Object.keys(STATE_TOPUPS) as StateSubsidy[]).map(k => (
                            <option key={k} value={k}>
                                {STATE_TOPUPS[k].name} {STATE_TOPUPS[k].topUpAmount > 0 ? `(+₹${STATE_TOPUPS[k].topUpAmount.toLocaleString()})` : ''}
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        {stateInfo.note}
                    </div>
                </div>
            </div>

            {/* Subsidy & Financial Breakdown Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                {/* 1. Gross Vendor Cost */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Turnkey System Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>
                        {formatCurrency(math.grossCost)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                        Standard MNRE benchmark @ ₹55/W
                    </div>
                </div>

                {/* 2. Direct Subsidy Grant */}
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Total Direct Subsidy</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 2 }}>
                        -{formatCurrency(math.totalSubsidy)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green-bright)', marginTop: 2 }}>
                        Central: ₹{math.centralDbt.toLocaleString()} {math.stateTopUp > 0 ? `+ State: ₹${math.stateTopUp.toLocaleString()}` : ''}
                    </div>
                </div>

                {/* 3. Net Out-Of-Pocket */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Your Net Contribution</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 2 }}>
                        {formatCurrency(math.netConsumerCost)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                        Payback in only <strong style={{ color: 'var(--green-bright)' }}>{math.paybackYears} years</strong>
                    </div>
                </div>

                {/* 4. Free Monthly Energy */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Free Solar Electricity</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                        ~{Math.round(math.annualGenerationKwh / 12)} <span style={{ fontSize: 12, fontWeight: 500 }}>units/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                        Saves ~{formatCurrency(math.annualSavingsInr)} / year
                    </div>
                </div>
            </div>

            {/* Step-by-Step National Portal Application Roadmap */}
            <div style={{ background: 'var(--raised)', padding: '16px 20px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Official National Portal (pmsuryaghar.gov.in) Application Checklist:</span>
                    <span style={{ fontSize: 11, color: 'var(--amber-bright)' }}>Step {completedStepsCount} of 7 Completed</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                    {[
                        { key: 'docElectricityBill', title: '1. Recent Electricity Bill', sub: 'Consumer Account Number & Registered Mobile Number' },
                        { key: 'docAadhaarBankLinked', title: '2. Aadhaar-Linked Bank Account', sub: 'For Direct DBT subsidy transfer within 30 days' },
                        { key: 'docRoofOwnership', title: '3. Roof Ownership / NOC', sub: 'Clear shadow-free rooftop possession proof' },
                        { key: 'portalRegistered', title: '4. National Portal Registration', sub: 'Register on pmsuryaghar.gov.in with Discom details' },
                        { key: 'discomNocIssued', title: '5. DISCOM Feasibility Approval', sub: 'Discom issues online technical feasibility NOC' },
                        { key: 'vendorSelected', title: '6. ALMM / DCR Module Vendor Selection', sub: 'Select empanelled installer offering 5-yr maintenance' },
                        { key: 'netMeterInstalled', title: '7. Net Metering & Inspection', sub: 'Discom installs bidirectional meter & generates commissioning certificate' },
                    ].map(step => {
                        const isDone = checklist[step.key as keyof typeof checklist];
                        return (
                            <div
                                key={step.key}
                                onClick={() => toggleStep(step.key as keyof typeof checklist)}
                                style={{
                                    background: isDone ? 'rgba(16,185,129,0.1)' : 'var(--surface)',
                                    border: isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--b1)',
                                    borderRadius: 6,
                                    padding: '10px 14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 10,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: 16 }}>{isDone ? '✅' : '⬜'}</span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: isDone ? 'var(--green-bright)' : 'var(--t1)' }}>
                                        {step.title}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                                        {step.sub}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
