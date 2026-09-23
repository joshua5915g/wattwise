'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

interface FaultDiagnosticScannerProps {
    panelKw: number;
    rate: number;
    annualKwh: number;
}

type FaultType = 'healthy' | 'dust' | 'diode' | 'clipping' | 'hotspot' | 'pid';

interface FaultDetail {
    id: FaultType;
    name: string;
    severity: 'Optimal' | 'Minor' | 'Moderate' | 'Critical';
    severityColor: string;
    efficiencyLossPercent: number;
    maxCellTempC: number;
    irPattern: string;
    rootCause: string;
    troubleshooting: string[];
    safetyRisk: string;
}

const FAULT_CATALOG: Record<FaultType, FaultDetail> = {
    healthy: {
        id: 'healthy',
        name: 'All Strings Healthy (Nominal)',
        severity: 'Optimal',
        severityColor: 'var(--green-bright)',
        efficiencyLossPercent: 0,
        maxCellTempC: 38,
        irPattern: 'Uniform thermal gradient across all module cells',
        rootCause: 'Normal PV operation with balanced MPPT voltage and clean front glass.',
        troubleshooting: ['Routine bi-monthly optical inspection', 'Maintain standard monitoring log'],
        safetyRisk: 'None (Safe operating parameters)'
    },
    dust: {
        id: 'dust',
        name: 'Uniform Dust & Soiling Layer',
        severity: 'Minor',
        severityColor: 'var(--amber-bright)',
        efficiencyLossPercent: 12,
        maxCellTempC: 44,
        irPattern: 'Diffused warm blanket effect on top surface',
        rootCause: 'Airborne dust, particulate accumulation, and urban soot blocking optical irradiance.',
        troubleshooting: ['Wash panels early morning with demineralized soft water', 'Avoid high-pressure chemical washers to protect anti-reflective coating'],
        safetyRisk: 'Low (Reduced generation only)'
    },
    diode: {
        id: 'diode',
        name: 'Bypass Diode Open-Circuit Failure',
        severity: 'Moderate',
        severityColor: 'var(--amber)',
        efficiencyLossPercent: 33,
        maxCellTempC: 68,
        irPattern: 'One full vertical sub-string running 25°C hotter than adjacent strings',
        rootCause: 'Shorted or blown Schottky bypass diode in the rear junction box due to lightning surge or thermal fatigue.',
        troubleshooting: ['Test junction box diodes with multimeter forward bias check', 'Replace failed 15A bypass diode module or warranty junction box'],
        safetyRisk: 'Medium (Localized junction heat)'
    },
    clipping: {
        id: 'clipping',
        name: 'Inverter MPPT Voltage Clipping',
        severity: 'Minor',
        severityColor: 'var(--blue-bright)',
        efficiencyLossPercent: 14,
        maxCellTempC: 48,
        irPattern: 'Flat plateaued power throughput during peak midday sun hours',
        rootCause: 'DC array oversized beyond central inverter maximum AC power input capacity (DC/AC ratio > 1.45).',
        troubleshooting: ['Reconfigure string layout across dual independent MPPT trackers', 'Consider adding microinverters for surplus string strings'],
        safetyRisk: 'Low (Inverter self-protects but wastes excess solar)'
    },
    hotspot: {
        id: 'hotspot',
        name: 'Cell Micro-Crack Hotspot',
        severity: 'Critical',
        severityColor: 'var(--red)',
        efficiencyLossPercent: 28,
        maxCellTempC: 88,
        irPattern: 'Intense concentrated pinpoint red thermal bloom on cell #14',
        rootCause: 'Internal silicon micro-crack caused by walking on panels during install or localized persistent bird dropping shadow.',
        troubleshooting: ['Isolate affected module to prevent string-wide derating', 'Initiate manufacturer warranty replacement (risk of EVA delamination/glass shatter)'],
        safetyRisk: 'High (Fire hazard & backsheet melting)'
    },
    pid: {
        id: 'pid',
        name: 'Potential-Induced Degradation (PID)',
        severity: 'Moderate',
        severityColor: 'var(--amber-bright)',
        efficiencyLossPercent: 22,
        maxCellTempC: 52,
        irPattern: 'Checkerboard thermal contrast on edge perimeter cells near grounded frame',
        rootCause: 'High system voltage driving sodium ion migration across glass into silicon in humid environments.',
        troubleshooting: ['Install night-time anti-PID voltage reversal box', 'Ensure proper grounding and use PID-resistant modules in humid coastal zones'],
        safetyRisk: 'Low (Accelerated long-term degradation)'
    }
};

export default function FaultDiagnosticScanner({ panelKw, rate, annualKwh }: FaultDiagnosticScannerProps) {
    const [activeFault, setActiveFault] = useState<FaultType>('healthy');
    const [colorPalette, setColorPalette] = useState<'thermal' | 'visual'>('thermal');

    const detail = FAULT_CATALOG[activeFault];
    const baseAnnual = annualKwh > 0 ? annualKwh : panelKw * 1550;

    const lostKwh = Math.round((baseAnnual * detail.efficiencyLossPercent) / 100);
    const lostRevenue = Math.round(lostKwh * rate);

    return (
        <div id="diagnostics" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🔍</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-bright)' }}>
                            Thermal Hotspot & Electrical Fault Diagnostic Engine
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Rooftop infrared thermography simulation, string anomaly detection, and root-cause recovery
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setColorPalette(colorPalette === 'thermal' ? 'visual' : 'thermal')}
                        className="btn btn-secondary"
                        style={{ fontSize: 12 }}
                    >
                        {colorPalette === 'thermal' ? '🌡️ IR Thermography Mode' : '📷 Visual RGB Mode'}
                    </button>
                    <span className="badge" style={{ borderColor: detail.severityColor, color: detail.severityColor }}>
                        Status: {detail.severity}
                    </span>
                </div>
            </div>

            {/* Fault Selection Buttons */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {(Object.keys(FAULT_CATALOG) as FaultType[]).map(key => {
                    const f = FAULT_CATALOG[key];
                    const isSelected = activeFault === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveFault(key)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 10,
                                border: isSelected ? `1px solid ${f.severityColor}` : '1px solid var(--b1)',
                                background: isSelected ? 'var(--raised)' : 'var(--surface)',
                                color: isSelected ? 'var(--t1)' : 'var(--t2)',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: isSelected ? 700 : 500,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {f.name}
                        </button>
                    );
                })}
            </div>

            {/* Thermal Visualizer & Detailed Diagnostic Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: 18, alignItems: 'center' }}>
                {/* Simulated Thermal Imaging Display */}
                <div style={{
                    position: 'relative',
                    background: '#09090F',
                    border: '1px solid var(--b1)',
                    borderRadius: 'var(--r-lg)',
                    padding: '24px',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg viewBox="0 0 300 160" style={{ width: '100%', maxWidth: 300, overflow: 'visible' }}>
                        {/* Module Frame */}
                        <rect x="20" y="20" width="260" height="120" rx="6" fill="#16161F" stroke="var(--b2)" strokeWidth="2" />

                        {/* 6 Photovoltaic Cells (2 rows x 3 cols) */}
                        {/* Cell 1 */}
                        <rect x="30" y="30" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'dust' ? '#C2410C' : activeFault === 'pid' ? '#9A3412' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                        {/* Cell 2 */}
                        <rect x="115" y="30" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'dust' ? '#C2410C' : activeFault === 'diode' ? '#DC2626' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                        {/* Cell 3 */}
                        <rect x="200" y="30" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'dust' ? '#C2410C' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                        {/* Cell 4 */}
                        <rect x="30" y="85" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'dust' ? '#C2410C' : activeFault === 'pid' ? '#9A3412' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                        {/* Cell 5 (Hotspot target) */}
                        <rect x="115" y="85" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'hotspot' ? '#EF4444' : activeFault === 'diode' ? '#DC2626' : activeFault === 'dust' ? '#C2410C' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                        {/* Hotspot pinpoint glow */}
                        {activeFault === 'hotspot' && (
                            <circle cx="150" cy="107" r="12" fill="#FDE047" className="float-glow" />
                        )}
                        {/* Cell 6 */}
                        <rect x="200" y="85" width="70" height="45" rx="3"
                            fill={colorPalette === 'thermal' ? (activeFault === 'dust' ? '#C2410C' : '#1E3A8A') : '#2563EB'} stroke="rgba(255,255,255,0.2)" />
                    </svg>

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 11, color: 'var(--t2)', marginTop: 8 }}>
                        <span>Thermal Spectrum: <span style={{ color: 'var(--blue-bright)' }}>25°C (Cold)</span></span>
                        <span>Peak Hotspot: <span style={{ color: detail.severityColor, fontWeight: 700 }}>{detail.maxCellTempC}°C</span></span>
                    </div>
                </div>

                {/* Diagnostic Analysis Card */}
                <div style={{ background: 'var(--raised)', border: '1px solid var(--b2)', borderRadius: 'var(--r-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{detail.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{detail.irPattern}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Yield Loss</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: detail.efficiencyLossPercent > 0 ? 'var(--red)' : 'var(--green-bright)' }}>
                                -{detail.efficiencyLossPercent}%
                            </div>
                        </div>
                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Annual Revenue Lost</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: lostRevenue > 0 ? 'var(--amber-bright)' : 'var(--green-bright)' }}>
                                {lostRevenue > 0 ? formatCurrency(lostRevenue) : '₹0'}
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                        <strong style={{ color: 'var(--t1)' }}>Root Cause:</strong> {detail.rootCause}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                        <strong style={{ color: 'var(--t1)' }}>Safety:</strong> {detail.safetyRisk}
                    </div>

                    <div style={{ borderTop: '1px solid var(--b1)', paddingTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-bright)', marginBottom: 4 }}>
                            🔧 Recommended Resolution:
                        </div>
                        <ul style={{ fontSize: 11, color: 'var(--t2)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {detail.troubleshooting.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
