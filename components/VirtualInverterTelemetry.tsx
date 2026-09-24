'use client';

import React, { useState, useEffect, useMemo } from 'react';

export type InverterBrand = 'sungrow' | 'enphase' | 'solaredge' | 'growatt' | 'huawei';

interface InverterSpecs {
    name: string;
    model: string;
    type: 'string' | 'micro' | 'hybrid';
    mpptChannels: number;
    ratedEfficiency: number;
    nominalAcVoltage: number;
    firmware: string;
    protocol: string;
    icon: string;
}

const INVERTER_MODELS: Record<InverterBrand, InverterSpecs> = {
    sungrow: {
        name: 'Sungrow Power',
        model: 'SG5.0RS-ADA (5.0 kW Single Phase)',
        type: 'string',
        mpptChannels: 2,
        ratedEfficiency: 98.4,
        nominalAcVoltage: 230,
        firmware: 'v2.14.88-B1',
        protocol: 'SunSpec Modbus TCP (Port 502)',
        icon: '⚡'
    },
    enphase: {
        name: 'Enphase Energy',
        model: 'IQ8+ Microinverter Array (Enviro IQ Gateway)',
        type: 'micro',
        mpptChannels: 4,
        ratedEfficiency: 97.5,
        nominalAcVoltage: 230,
        firmware: 'v07.03.490',
        protocol: 'Enphase Enlighten WebSocket / JSON API',
        icon: '🔌'
    },
    solaredge: {
        name: 'SolarEdge Technologies',
        model: 'SE5000H HD-Wave with P404 DC Optimizers',
        type: 'hybrid',
        mpptChannels: 2,
        ratedEfficiency: 99.2,
        nominalAcVoltage: 230,
        firmware: 'v4.19.42',
        protocol: 'SolarEdge Monitoring API / Modbus SunSpec',
        icon: '💎'
    },
    growatt: {
        name: 'Growatt New Energy',
        model: 'MIN 5000TL-X Smart Inverter',
        type: 'string',
        mpptChannels: 2,
        ratedEfficiency: 98.2,
        nominalAcVoltage: 230,
        firmware: 'v3.8.0',
        protocol: 'ShineServer MQTT / Modbus RTU RS485',
        icon: '🔋'
    },
    huawei: {
        name: 'Huawei FusionSolar',
        model: 'SUN2000-5KTL-L1 Smart Energy Center',
        type: 'hybrid',
        mpptChannels: 2,
        ratedEfficiency: 98.6,
        nominalAcVoltage: 230,
        firmware: 'V200R001C00SPC120',
        protocol: 'FusionSolar Cloud Northbound API / Modbus TCP',
        icon: '🌐'
    }
};

interface VirtualInverterTelemetryProps {
    panelKw: number;
    currentOutputKw: number;
}

export default function VirtualInverterTelemetry({
    panelKw,
    currentOutputKw
}: VirtualInverterTelemetryProps) {
    const [selectedBrand, setSelectedBrand] = useState<InverterBrand>('sungrow');
    const [faultMode, setFaultMode] = useState<'normal' | 'grid_surge' | 'ground_fault' | 'thermal_clipping'>('normal');
    const [isStreaming, setIsStreaming] = useState<boolean>(true);
    const [packetHistory, setPacketHistory] = useState<string[]>([]);
    const [tick, setTick] = useState<number>(0);

    const inverter = INVERTER_MODELS[selectedBrand];

    // Live telemetry calculations
    const telemetry = useMemo(() => {
        const jitter = (Math.sin(tick) * 0.03);
        const baseAcKw = Math.max(0.1, currentOutputKw > 0 ? currentOutputKw : panelKw * 0.65) + jitter;

        let acVoltage = 230.8 + (Math.sin(tick * 1.5) * 2.4);
        let gridFreq = 50.01 + (Math.cos(tick) * 0.04);
        let igbtTemp = 41.2 + (baseAcKw * 2.5) + (Math.sin(tick * 0.8) * 1.2);
        let status = 'ONLINE / INVERTING';
        let statusColor = 'var(--green-bright)';

        if (faultMode === 'grid_surge') {
            acVoltage = 264.5; // Exceeds IEEE 1547 / CEA limit
            status = 'FAULT: GRID OVER-VOLTAGE (264V TRIP)';
            statusColor = '#EF4444';
        } else if (faultMode === 'ground_fault') {
            status = 'ALARM: DC ISOLATION RESISTANCE < 0.2 MΩ';
            statusColor = '#F59E0B';
        } else if (faultMode === 'thermal_clipping') {
            igbtTemp = 74.8;
            status = 'WARN: IGBT THERMAL DERATING (75°C)';
            statusColor = '#F59E0B';
        }

        const mppt1Voltage = 362.4 + (Math.cos(tick * 1.1) * 3.1);
        const mppt1Current = Math.max(0.2, (baseAcKw * 500) / mppt1Voltage);
        const mppt1Power = Math.round(mppt1Voltage * mppt1Current);

        const mppt2Voltage = 358.1 + (Math.sin(tick * 1.2) * 2.8);
        const mppt2Current = Math.max(0.2, (baseAcKw * 480) / mppt2Voltage);
        const mppt2Power = Math.round(mppt2Voltage * mppt2Current);

        const totalDcPower = (mppt1Power + mppt2Power) / 1000;
        const acPowerKw = +(totalDcPower * (inverter.ratedEfficiency / 100)).toFixed(2);
        const acCurrent = +( (acPowerKw * 1000) / Math.max(1, acVoltage) ).toFixed(2);
        const powerFactor = 0.998;

        return {
            status,
            statusColor,
            acVoltage: +acVoltage.toFixed(1),
            gridFreq: +gridFreq.toFixed(2),
            acPowerKw,
            acCurrent,
            powerFactor,
            igbtTemp: +igbtTemp.toFixed(1),
            mppt1Voltage: +mppt1Voltage.toFixed(1),
            mppt1Current: +mppt1Current.toFixed(2),
            mppt1Power,
            mppt2Voltage: +mppt2Voltage.toFixed(1),
            mppt2Current: +mppt2Current.toFixed(2),
            mppt2Power,
            efficiency: inverter.ratedEfficiency
        };
    }, [tick, currentOutputKw, panelKw, faultMode, inverter]);

    // Live streaming ticker
    useEffect(() => {
        if (!isStreaming) return;
        const interval = setInterval(() => {
            setTick(t => t + 1);

            // Generate Modbus RTU / SunSpec Hex Frames
            const regAddr = (40000 + Math.floor(Math.random() * 70)).toString(16).toUpperCase();
            const hexVal = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0').toUpperCase();
            const packet = `[${new Date().toLocaleTimeString('en-IN')}] RX SunSpec DevID:0x01 Func:0x03 Reg:0x${regAddr} Data:0x${hexVal} CRC:0x${Math.floor(Math.random()*255).toString(16).toUpperCase()} (OK)`;

            setPacketHistory(prev => [packet, ...prev.slice(0, 5)]);
        }, 2000);

        return () => clearInterval(interval);
    }, [isStreaming]);

    return (
        <div id="virtual-inverter" className="card fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🔌</span>
                        <div className="section-label" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-bright)' }}>
                            Virtual Inverter Hardware Telemetry Stream (SunSpec / Modbus IoT)
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Simulate real-time MPPT string voltages, grid synchronization (50 Hz), and SunSpec Modbus register frames
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={() => setIsStreaming(!isStreaming)}
                        className="btn btn-secondary"
                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                        <span>{isStreaming ? '⏸ Pause Stream' : '▶ Resume Stream'}</span>
                    </button>
                    <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: telemetry.statusColor, border: '1px solid rgba(16,185,129,0.3)' }}>
                        <div className="live-dot" style={{ width: 6, height: 6, background: telemetry.statusColor }} />
                        {telemetry.status}
                    </span>
                </div>
            </div>

            {/* Inverter Selector & Diagnostic Fault Injection Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {/* 1. Inverter Model Selector */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
                        Connected Inverter Hardware Profile:
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={e => setSelectedBrand(e.target.value as InverterBrand)}
                        style={{
                            width: '100%',
                            background: 'var(--surface)',
                            border: '1px solid var(--b2)',
                            borderRadius: 6,
                            padding: '9px 12px',
                            color: 'var(--t1)',
                            fontSize: 12,
                            fontWeight: 600,
                            outline: 'none'
                        }}
                    >
                        {(Object.keys(INVERTER_MODELS) as InverterBrand[]).map(key => {
                            const inv = INVERTER_MODELS[key];
                            return (
                                <option key={key} value={key}>
                                    {inv.icon} {inv.name} — {inv.model}
                                </option>
                            );
                        })}
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>
                        Protocol: <span style={{ color: 'var(--blue-bright)' }}>{inverter.protocol}</span> · Firmware: {inverter.firmware}
                    </div>
                </div>

                {/* 2. Fault Injection Diagnostic Simulator */}
                <div style={{ background: 'var(--raised)', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)' }}>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
                        Hardware Fault Injection Test:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {[
                            { id: 'normal', label: '✓ Normal Inverting', color: 'var(--green-bright)' },
                            { id: 'grid_surge', label: '⚡ Grid Over-Voltage (264V)', color: '#F87171' },
                            { id: 'ground_fault', label: '⚠️ Ground Insulation Drop', color: 'var(--amber-bright)' },
                            { id: 'thermal_clipping', label: '🌡️ IGBT Thermal Derating', color: 'var(--amber-bright)' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFaultMode(f.id as any)}
                                style={{
                                    padding: '7px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: faultMode === f.id ? 'var(--surface)' : 'rgba(255,255,255,0.03)',
                                    color: faultMode === f.id ? f.color : 'var(--t3)',
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    borderColor: faultMode === f.id ? f.color : 'var(--b1)'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inverter Dual MPPT & AC Grid Telemetry Gauge Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {/* MPPT 1 */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span>MPPT 1 DC String</span>
                        <span style={{ color: 'var(--blue-bright)', fontWeight: 700 }}>CH 1</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-bright)', marginTop: 4 }}>
                        {telemetry.mppt1Voltage} <span style={{ fontSize: 12, fontWeight: 500 }}>Vdc</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Current: <strong>{telemetry.mppt1Current} A</strong></span>
                        <span>Power: <strong>{telemetry.mppt1Power} W</strong></span>
                    </div>
                </div>

                {/* MPPT 2 */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span>MPPT 2 DC String</span>
                        <span style={{ color: 'var(--cyan-bright)', fontWeight: 700 }}>CH 2</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyan-bright)', marginTop: 4 }}>
                        {telemetry.mppt2Voltage} <span style={{ fontSize: 12, fontWeight: 500 }}>Vdc</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Current: <strong>{telemetry.mppt2Current} A</strong></span>
                        <span>Power: <strong>{telemetry.mppt2Power} W</strong></span>
                    </div>
                </div>

                {/* AC Grid Output */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span>AC Grid Output (Single Phase)</span>
                        <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>50 Hz</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)', marginTop: 4 }}>
                        {telemetry.acVoltage} <span style={{ fontSize: 12, fontWeight: 500 }}>Vac @ {telemetry.gridFreq} Hz</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Current: <strong>{telemetry.acCurrent} A</strong></span>
                        <span>Power Factor: <strong>{telemetry.powerFactor}</strong></span>
                    </div>
                </div>

                {/* Inverter Efficiency & IGBT Temp */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b1)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Inverter Conversion Efficiency</span>
                        <span style={{ color: 'var(--amber-bright)', fontWeight: 700 }}>IGBT</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber-bright)', marginTop: 4 }}>
                        {telemetry.efficiency}% <span style={{ fontSize: 12, fontWeight: 500 }}>η Max</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Heat Sink: <strong style={{ color: telemetry.igbtTemp > 65 ? '#F87171' : 'var(--t1)' }}>{telemetry.igbtTemp}°C</strong></span>
                        <span>Power: <strong>{telemetry.acPowerKw} kW</strong></span>
                    </div>
                </div>
            </div>

            {/* SunSpec / Modbus RTU Hex Register Packet Viewer */}
            <div style={{ background: '#090D16', padding: '14px 18px', borderRadius: 'var(--r)', border: '1px solid var(--b1)', fontFamily: 'monospace' }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>📟 Live SunSpec Modbus RTU Frame Stream:</span>
                    <span style={{ color: 'var(--green-bright)', fontSize: 10 }}>● 9600 Baud / 8-N-1 TCP Stream</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 110, overflowY: 'hidden' }}>
                    {packetHistory.map((p, idx) => (
                        <div key={idx} style={{ fontSize: 11, color: idx === 0 ? 'var(--green-bright)' : 'var(--t3)', opacity: 1 - (idx * 0.15) }}>
                            {p}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
