'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface DiscomInfo {
    id: string;
    state: string;
    discomName: string;
    shortName: string;
    slabs: { min: number; max: number; rate: number }[];
    fixedCharge: number;
    peakSurcharge: number; // ₹/kWh added in peak hours (18:00 - 22:00)
    solarRebate: number; // ₹/kWh incentive for solar self-generation
    netMeterBankingRate: number; // ₹/kWh paid by discom for exported surplus units
    description: string;
    logoColor: string;
}

export const INDIAN_DISCOMS: DiscomInfo[] = [
    {
        id: 'msedcl_mh',
        state: 'Maharashtra',
        discomName: 'Maharashtra State Electricity Distribution Co. (MSEDCL)',
        shortName: 'MSEDCL (Mahavitaran)',
        slabs: [
            { min: 0, max: 100, rate: 4.71 },
            { min: 101, max: 300, rate: 10.29 },
            { min: 301, max: 500, rate: 14.55 },
            { min: 501, max: 9999, rate: 16.64 }
        ],
        fixedCharge: 128,
        peakSurcharge: 1.50,
        solarRebate: 0.15,
        netMeterBankingRate: 3.80,
        description: 'Highest tiered tariffs in India — solar delivers the fastest payback under 3 years for >300 unit consumers.',
        logoColor: '#F59E0B'
    },
    {
        id: 'bescom_ka',
        state: 'Karnataka',
        discomName: 'Bangalore Electricity Supply Company (BESCOM)',
        shortName: 'BESCOM (Bengaluru)',
        slabs: [
            { min: 0, max: 100, rate: 4.75 },
            { min: 101, max: 9999, rate: 7.00 }
        ],
        fixedCharge: 110,
        peakSurcharge: 1.00,
        solarRebate: 0.10,
        netMeterBankingRate: 3.50,
        description: 'Simplified 2-tier structure with robust ToD metering incentives for tech hubs and villas.',
        logoColor: '#3B82F6'
    },
    {
        id: 'bses_dl',
        state: 'Delhi (NCT)',
        discomName: 'BSES Rajdhani / Yamuna Power Ltd',
        shortName: 'BSES (Delhi)',
        slabs: [
            { min: 0, max: 200, rate: 0.00 }, // 100% Delhi Govt Subsidy
            { min: 201, max: 400, rate: 4.50 },
            { min: 401, max: 800, rate: 6.50 },
            { min: 801, max: 9999, rate: 8.00 }
        ],
        fixedCharge: 90,
        peakSurcharge: 0.80,
        solarRebate: 2.00, // Solar generation incentive ₹2/kWh
        netMeterBankingRate: 3.10,
        description: 'Zero-bill lifeline (<200 units) and strong ₹2/kWh Generation Based Incentive (GBI) for rooftop solar.',
        logoColor: '#10B981'
    },
    {
        id: 'tangedco_tn',
        state: 'Tamil Nadu',
        discomName: 'Tamil Nadu Generation and Distribution Corp (TANGEDCO)',
        shortName: 'TANGEDCO (TN)',
        slabs: [
            { min: 0, max: 100, rate: 0.00 },
            { min: 101, max: 200, rate: 2.25 },
            { min: 201, max: 400, rate: 4.50 },
            { min: 401, max: 500, rate: 6.00 },
            { min: 501, max: 600, rate: 8.00 },
            { min: 601, max: 9999, rate: 10.00 }
        ],
        fixedCharge: 80,
        peakSurcharge: 1.20,
        solarRebate: 0.00,
        netMeterBankingRate: 3.25,
        description: '100 free units bi-monthly with progressive steep tariffs exceeding 500 units.',
        logoColor: '#8B5CF6'
    },
    {
        id: 'ugvcl_gj',
        state: 'Gujarat',
        discomName: 'Gujarat Urja Vikas Nigam (UGVCL / DGVCL)',
        shortName: 'Surya Gujarat (GUVNL)',
        slabs: [
            { min: 0, max: 100, rate: 3.05 },
            { min: 101, max: 250, rate: 3.50 },
            { min: 251, max: 9999, rate: 5.20 }
        ],
        fixedCharge: 70,
        peakSurcharge: 0.75,
        solarRebate: 0.20,
        netMeterBankingRate: 2.25,
        description: 'Pioneer of residential rooftop solar with streamlined DISCOM integration and fast net meter approvals.',
        logoColor: '#06B6D4'
    },
    {
        id: 'uppcl_up',
        state: 'Uttar Pradesh',
        discomName: 'UP Power Corporation Limited (UPPCL / PVVNL)',
        shortName: 'UPPCL (Uttar Pradesh)',
        slabs: [
            { min: 0, max: 150, rate: 5.50 },
            { min: 151, max: 300, rate: 6.00 },
            { min: 301, max: 500, rate: 6.50 },
            { min: 501, max: 9999, rate: 7.00 }
        ],
        fixedCharge: 110,
        peakSurcharge: 1.25,
        solarRebate: 0.00,
        netMeterBankingRate: 2.90,
        description: 'Eligible for both Central PM Surya Ghar (₹78k) and UP State Top-up Subsidy (up to ₹30k).',
        logoColor: '#EC4899'
    },
    {
        id: 'tsspdcl_ts',
        state: 'Telangana',
        discomName: 'Southern Power Distribution Company of Telangana (TSSPDCL)',
        shortName: 'TSSPDCL (Hyderabad)',
        slabs: [
            { min: 0, max: 100, rate: 3.30 },
            { min: 101, max: 200, rate: 4.30 },
            { min: 201, max: 300, rate: 7.20 },
            { min: 301, max: 400, rate: 8.50 },
            { min: 401, max: 9999, rate: 9.50 }
        ],
        fixedCharge: 95,
        peakSurcharge: 1.10,
        solarRebate: 0.10,
        netMeterBankingRate: 3.40,
        description: 'Steep tier jump past 200 units makes solar highly lucrative for urban Hyderabad households.',
        logoColor: '#14B8A6'
    },
    {
        id: 'wbsedcl_wb',
        state: 'West Bengal',
        discomName: 'West Bengal State Electricity Distribution Co. (WBSEDCL)',
        shortName: 'WBSEDCL (Kolkata/WB)',
        slabs: [
            { min: 0, max: 102, rate: 5.30 },
            { min: 103, max: 180, rate: 5.97 },
            { min: 181, max: 300, rate: 6.97 },
            { min: 301, max: 600, rate: 7.31 },
            { min: 601, max: 9999, rate: 8.99 }
        ],
        fixedCharge: 85,
        peakSurcharge: 1.00,
        solarRebate: 0.00,
        netMeterBankingRate: 3.15,
        description: 'Quarterly billing cycles with progressive ToD rates for residential complexes.',
        logoColor: '#F97316'
    }
];

interface DiscomTariffEngineProps {
    currentRate: number;
    dailySolarKwh: number;
    onApplyRate: (newRate: number) => void;
}

export default function DiscomTariffEngine({
    currentRate,
    dailySolarKwh,
    onApplyRate
}: DiscomTariffEngineProps) {
    const [selectedDiscomId, setSelectedDiscomId] = useState<string>('msedcl_mh');
    const [monthlyConsumption, setMonthlyConsumption] = useState<number>(450); // units/month
    const [isToDActive, setIsToDActive] = useState<boolean>(true);
    const [peakConsumptionPercent, setPeakConsumptionPercent] = useState<number>(35); // % during 6-10 PM

    const discom = useMemo(() => {
        return INDIAN_DISCOMS.find(d => d.id === selectedDiscomId) || INDIAN_DISCOMS[0];
    }, [selectedDiscomId]);

    // Calculate Slab Bill function
    const computeSlabBill = (units: number, discomInfo: DiscomInfo) => {
        if (units <= 0) return discomInfo.fixedCharge;
        let remaining = units;
        let energyCharge = 0;

        for (const slab of discomInfo.slabs) {
            const slabCapacity = slab.max - slab.min + 1;
            const unitsInThisSlab = Math.min(remaining, slabCapacity);
            energyCharge += unitsInThisSlab * slab.rate;
            remaining -= unitsInThisSlab;
            if (remaining <= 0) break;
        }

        return energyCharge + discomInfo.fixedCharge;
    };

    const monthlySolarGeneration = Math.round(dailySolarKwh * 30);

    const calculations = useMemo(() => {
        // 1. Grid Bill Before Solar
        const baseBillBefore = computeSlabBill(monthlyConsumption, discom);
        const peakUnitsBefore = (monthlyConsumption * (peakConsumptionPercent / 100));
        const todSurchargeBefore = isToDActive ? peakUnitsBefore * discom.peakSurcharge : 0;
        const totalBillBefore = Math.round(baseBillBefore + todSurchargeBefore);

        const effectiveRateBefore = +(totalBillBefore / Math.max(1, monthlyConsumption)).toFixed(2);

        // 2. Grid Bill After Solar (Net Metering)
        const netGridUnits = Math.max(0, monthlyConsumption - monthlySolarGeneration);
        const surplusExportUnits = Math.max(0, monthlySolarGeneration - monthlyConsumption);

        const baseBillAfter = computeSlabBill(netGridUnits, discom);
        const peakUnitsAfter = (netGridUnits * (peakConsumptionPercent / 100));
        const todSurchargeAfter = isToDActive ? peakUnitsAfter * discom.peakSurcharge : 0;
        const exportCredit = Math.round(surplusExportUnits * discom.netMeterBankingRate);

        const totalBillAfter = Math.max(discom.fixedCharge, Math.round(baseBillAfter + todSurchargeAfter - exportCredit));

        // 3. Monthly & Annual Savings
        const monthlySavings = Math.max(0, totalBillBefore - totalBillAfter);
        const annualSavings = monthlySavings * 12;
        const billReductionPercent = Math.min(100, Math.round((monthlySavings / Math.max(1, totalBillBefore)) * 100));

        return {
            totalBillBefore,
            totalBillAfter,
            effectiveRateBefore,
            monthlySavings,
            annualSavings,
            billReductionPercent,
            netGridUnits,
            surplusExportUnits,
            exportCredit
        };
    }, [monthlyConsumption, monthlySolarGeneration, discom, isToDActive, peakConsumptionPercent]);

    return (
        <div id="discom-tariff" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>⚡</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber-bright)' }}>
                            Indian State DISCOM Tariff & Time-of-Day (ToD) Engine
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Simulate exact tiered slab bills, peak-hour ToD surcharges, and net-metering credits across Indian utility providers
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => onApplyRate(calculations.effectiveRateBefore)}
                        className="btn btn-primary"
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        title="Sync this DISCOM rate across the whole WattWise dashboard"
                    >
                        <span>✓ Apply ₹{calculations.effectiveRateBefore}/kWh to System</span>
                    </button>
                    <span className="badge badge-green">
                        {calculations.billReductionPercent}% Bill Reduction
                    </span>
                </div>
            </div>

            {/* Controls Bar: DISCOM Dropdown + Consumption Slider */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {/* DISCOM Select */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Select Your State Power Utility (DISCOM):</span>
                        <span style={{ color: discom.logoColor, fontWeight: 700 }}>{discom.state}</span>
                    </div>
                    <select
                        value={selectedDiscomId}
                        onChange={e => setSelectedDiscomId(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'var(--surface)',
                            border: '1px solid var(--b2)',
                            borderRadius: 6,
                            padding: '9px 12px',
                            color: 'var(--t1)',
                            fontSize: 13,
                            fontWeight: 600,
                            outline: 'none'
                        }}
                    >
                        {INDIAN_DISCOMS.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.shortName} · {d.state}
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6, lineHeight: 1.35 }}>
                        {discom.description}
                    </div>
                </div>

                {/* Monthly Consumption Slider */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Monthly Household Consumption:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-bright)' }}>
                            {monthlyConsumption} <span style={{ fontSize: 11, fontWeight: 500 }}>kWh / mo</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="1500"
                        step="25"
                        value={monthlyConsumption}
                        onChange={e => setMonthlyConsumption(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--blue)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        <span>50 kWh (1BHK)</span>
                        <span>400 kWh (3BHK + AC)</span>
                        <span>1500 kWh (Villa / EV)</span>
                    </div>
                </div>

                {/* ToD Peak Surcharge Toggle */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Time-of-Day (ToD) 6-10 PM Peak Surcharge:</span>
                        <button
                            onClick={() => setIsToDActive(!isToDActive)}
                            style={{
                                background: isToDActive ? 'var(--amber)' : 'var(--surface)',
                                color: isToDActive ? '#000' : 'var(--t3)',
                                border: 'none',
                                borderRadius: 12,
                                padding: '3px 10px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {isToDActive ? 'ON (+₹' + discom.peakSurcharge + '/u)' : 'OFF'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <input
                            type="range"
                            min="10"
                            max="70"
                            step="5"
                            disabled={!isToDActive}
                            value={peakConsumptionPercent}
                            onChange={e => setPeakConsumptionPercent(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--amber)' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--t2)', minWidth: 55, fontWeight: 700 }}>
                            {peakConsumptionPercent}% load
                        </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>
                        Peak hours (18:00 - 22:00) when grid power costs the most
                    </div>
                </div>
            </div>

            {/* Main Financial Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {/* Before Solar */}
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Grid Bill (Before Solar)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#F87171', marginTop: 4 }}>
                        {formatCurrency(calculations.totalBillBefore)} <span style={{ fontSize: 12, fontWeight: 500 }}>/ mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Effective blend rate: <strong style={{ color: 'var(--t1)' }}>₹{calculations.effectiveRateBefore}/kWh</strong>
                    </div>
                </div>

                {/* After Solar */}
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Grid Bill (With Solar)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-bright)', marginTop: 4 }}>
                        {formatCurrency(calculations.totalBillAfter)} <span style={{ fontSize: 12, fontWeight: 500 }}>/ mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Grid Import: <strong>{calculations.netGridUnits} units</strong> {calculations.surplusExportUnits > 0 ? `· Export: +${calculations.surplusExportUnits} u` : ''}
                    </div>
                </div>

                {/* Monthly Savings */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Net Savings</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 4 }}>
                        +{formatCurrency(calculations.monthlySavings)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Instant bill reduction: <strong style={{ color: 'var(--green-bright)' }}>{calculations.billReductionPercent}%</strong>
                    </div>
                </div>

                {/* Annual Savings */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annual Cash In Pocket</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 4 }}>
                        +{formatCurrency(calculations.annualSavings)} <span style={{ fontSize: 12, fontWeight: 500 }}>/ yr</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>
                        Surplus export banking: ₹{discom.netMeterBankingRate}/kWh
                    </div>
                </div>
            </div>

            {/* Tiered Tariff Slab Visualizer */}
            <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Official {discom.shortName} Residential Tariff Slab Breakdown:</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>Fixed Meter Charge: ₹{discom.fixedCharge}/mo</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${discom.slabs.length}, 1fr)`, gap: 8 }}>
                    {discom.slabs.map((s, idx) => {
                        const isHit = monthlyConsumption > s.min;
                        const isFullyInSlab = monthlyConsumption >= s.max;
                        return (
                            <div
                                key={idx}
                                style={{
                                    background: isHit ? 'rgba(59,130,246,0.12)' : 'var(--surface)',
                                    border: isHit ? '1px solid rgba(59,130,246,0.35)' : '1px solid var(--b1)',
                                    padding: '10px 12px',
                                    borderRadius: 6,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                }}
                            >
                                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>
                                    {s.min} - {s.max > 5000 ? 'Above' : s.max} Units
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: s.rate === 0 ? 'var(--green-bright)' : 'var(--t1)' }}>
                                    {s.rate === 0 ? 'FREE (₹0)' : `₹${s.rate.toFixed(2)}`}
                                    <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)' }}> /kWh</span>
                                </div>
                                <div style={{ fontSize: 10, color: isHit ? 'var(--blue-bright)' : 'var(--t3)', marginTop: 2 }}>
                                    {isFullyInSlab ? '● Full Slab Consumed' : isHit ? '◐ Partial In Slab' : '○ Not Reached'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
