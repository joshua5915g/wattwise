'use client';

import React, { useState, useMemo } from 'react';
import type { PredictionResult } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface EVSolarSyncProps {
    prediction: PredictionResult | null;
    panelKw: number;
    electricityRate: number;
}

interface EVModel {
    id: string;
    name: string;
    type: 'car' | '2-wheeler';
    batteryCapacityKwh: number;
    kmPerKwh: number; // efficiency
    chargeRateKw: number;
    icon: string;
}

const POPULAR_EVS: EVModel[] = [
    { id: 'nexon', name: 'Tata Nexon EV Max', type: 'car', batteryCapacityKwh: 40.5, kmPerKwh: 7.5, chargeRateKw: 3.3, icon: '🚙' },
    { id: 'mg', name: 'MG ZS EV Long Range', type: 'car', batteryCapacityKwh: 50.3, kmPerKwh: 7.2, chargeRateKw: 3.3, icon: '🚘' },
    { id: 'xuv', name: 'Mahindra XUV400 EV', type: 'car', batteryCapacityKwh: 39.4, kmPerKwh: 7.0, chargeRateKw: 3.3, icon: '🚗' },
    { id: 'ather', name: 'Ather 450X Gen 3', type: '2-wheeler', batteryCapacityKwh: 3.7, kmPerKwh: 28.0, chargeRateKw: 1.0, icon: '🛵' },
    { id: 'ola', name: 'Ola S1 Pro Gen 2', type: '2-wheeler', batteryCapacityKwh: 4.0, kmPerKwh: 30.0, chargeRateKw: 1.0, icon: '⚡' },
];

export default function EVSolarSync({ prediction, panelKw, electricityRate }: EVSolarSyncProps) {
    const [selectedEvId, setSelectedEvId] = useState<string>('nexon');
    const [evSoc, setEvSoc] = useState<number>(45); // Current EV battery 45%
    const [targetSoc, setTargetSoc] = useState<number>(90); // Target 90%
    const [departureHour, setDepartureHour] = useState<number>(8); // Departure 8:00 AM

    const currentEv = POPULAR_EVS.find(e => e.id === selectedEvId) || POPULAR_EVS[0];

    const currentSolarKw = prediction
        ? (prediction.hourly_output[new Date().getHours()] ?? prediction.peak_output * 0.75)
        : panelKw * 0.5;

    const calculations = useMemo(() => {
        const kwhNeeded = (currentEv.batteryCapacityKwh * Math.max(0, targetSoc - evSoc)) / 100;
        const totalKmAdded = +(kwhNeeded * currentEv.kmPerKwh).toFixed(0);

        // Free solar km generated per hour of charging right now
        const effectiveSolarChargeKw = Math.min(currentSolarKw, currentEv.chargeRateKw);
        const freeKmPerHour = +(effectiveSolarChargeKw * currentEv.kmPerKwh).toFixed(1);

        // Petrol displacement savings (Assuming 15 km/liter for car @ ₹102/L, 45 km/L for scooter @ ₹102/L)
        const petrolLitersOffset = currentEv.type === 'car' ? totalKmAdded / 15 : totalKmAdded / 45;
        const petrolRupeesSaved = +(petrolLitersOffset * 102).toFixed(0);
        const gridElectricityCost = +(kwhNeeded * electricityRate).toFixed(0);
        const netSolarSaved = +(petrolRupeesSaved - (kwhNeeded > effectiveSolarChargeKw ? (kwhNeeded - effectiveSolarChargeKw) * electricityRate : 0)).toFixed(0);

        // Hours to charge at current solar rate
        const solarChargeHours = effectiveSolarChargeKw > 0 ? +(kwhNeeded / effectiveSolarChargeKw).toFixed(1) : 0;

        return {
            kwhNeeded: +kwhNeeded.toFixed(1),
            totalKmAdded,
            freeKmPerHour,
            petrolRupeesSaved,
            gridElectricityCost,
            netSolarSaved,
            solarChargeHours,
            solarFractionPercent: effectiveSolarChargeKw >= currentEv.chargeRateKw ? 100 : Math.round((effectiveSolarChargeKw / currentEv.chargeRateKw) * 100),
        };
    }, [currentEv, evSoc, targetSoc, currentSolarKw, electricityRate]);

    return (
        <div id="ev-sync" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🚗</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Smart EV Solar Sync & Free Green Kilometers Estimator
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Sync electric car/scooter charging with rooftop solar to drive 100% free on sunlight
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-green">
                        ⚡ +{calculations.freeKmPerHour} free km/hr right now
                    </span>
                </div>
            </div>

            {/* EV Model Selector Chips */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {POPULAR_EVS.map(ev => {
                    const isSelected = ev.id === selectedEvId;
                    return (
                        <button
                            key={ev.id}
                            onClick={() => setSelectedEvId(ev.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 14px',
                                borderRadius: 10,
                                border: isSelected ? '1px solid var(--green-bright)' : '1px solid var(--b1)',
                                background: isSelected ? 'var(--green-dim)' : 'var(--raised)',
                                color: isSelected ? 'var(--t1)' : 'var(--t2)',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: isSelected ? 700 : 500,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{ev.icon}</span>
                            <span>{ev.name}</span>
                            <span style={{ fontSize: 10, opacity: 0.7 }}>({ev.batteryCapacityKwh} kWh)</span>
                        </button>
                    );
                })}
            </div>

            {/* Hero Free Solar Driving Metrics */}
            <div style={{
                background: 'radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, rgba(9,9,15,0.95) 75%)',
                border: '1px solid var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '24px 28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Green Range Added</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--green-bright)', marginTop: 2 }}>
                        +{calculations.totalKmAdded} <span style={{ fontSize: 15, fontWeight: 600 }}>km</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                        Requires {calculations.kwhNeeded} kWh ({evSoc}% → {targetSoc}%)
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Petrol Displaced Saved</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 2 }}>
                        {formatCurrency(calculations.petrolRupeesSaved)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Vs ₹102/L Indian fuel price</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Solar Self-Covered Rate</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 2 }}>
                        {calculations.solarFractionPercent}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{calculations.freeKmPerHour} free km/hour of sun</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Target Departure</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>
                        {departureHour}:00 AM
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green-bright)', marginTop: 2 }}>Ready with 100% solar</div>
                </div>
            </div>

            {/* Interactive Charge Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Current EV Battery (SoC):</span>
                        <span style={{ fontWeight: 700, color: 'var(--amber-bright)' }}>{evSoc}%</span>
                    </div>
                    <input
                        type="range" min="5" max="95" step="5"
                        value={evSoc}
                        onChange={e => setEvSoc(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Target Charge Level:</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-bright)' }}>{targetSoc}%</span>
                    </div>
                    <input
                        type="range" min={evSoc} max="100" step="5"
                        value={targetSoc}
                        onChange={e => setTargetSoc(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--t2)' }}>Next Departure Hour:</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>{departureHour}:00 AM</span>
                    </div>
                    <input
                        type="range" min="5" max="11" step="1"
                        value={departureHour}
                        onChange={e => setDepartureHour(+e.target.value)}
                        className="slider-custom"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}
