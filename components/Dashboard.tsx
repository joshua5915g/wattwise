'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_LOCATION, DEFAULT_PANEL_CAPACITY, DEFAULT_ELECTRICITY_RATE, REFRESH_INTERVAL } from '@/lib/constants';
import { getPrediction, getAIAdvice, getWeatherData } from '@/lib/api';
import { getEfficiencyStatus, formatCurrency, getCurrentDayOfYear } from '@/lib/utils';
import type { PredictionResult, WeatherData, AIAdviceResult } from '@/lib/types';

import MetricCard          from './MetricCard';
import SolarCurveChart     from './SolarCurveChart';
import WeatherTicker       from './WeatherTicker';
import AIAdvicePanel       from './AIAdvicePanel';
import ExperimentControls  from './ExperimentControls';
import LocationSelector    from './LocationSelector';
import BatteryOptimization from './BatteryOptimization';
import Toast               from './Toast';
import SolarGauge          from './SolarGauge';
import CO2Card             from './CO2Card';
import SavingsGoalCard     from './SavingsGoalCard';
import PanelHealthCard     from './PanelHealthCard';

interface DashboardProps {
    initialExperimentMode?: boolean;
    showExperimentControls?: boolean;
    disableLiveWeather?: boolean;
}

const HIST = 14;

export default function Dashboard({
    initialExperimentMode = false,
    showExperimentControls = false,
    disableLiveWeather = false,
}: DashboardProps) {

    // ── State ───────────────────────────────────────────────────
    const [location, setLocation]         = useState(DEFAULT_LOCATION);
    const [expMode, setExpMode]           = useState(initialExperimentMode);
    const [panelKw, setPanelKw]           = useState(DEFAULT_PANEL_CAPACITY);
    const [rate, setRate]                 = useState(DEFAULT_ELECTRICITY_RATE);

    const [simTemp, setSimTemp]           = useState(28.0);
    const [simCloud, setSimCloud]         = useState(30.0);
    const [simHum, setSimHum]             = useState(65.0);
    const [weather, setWeather]           = useState<WeatherData | null>(null);

    const [pred, setPred]                 = useState<PredictionResult | null>(null);
    const [advice, setAdvice]             = useState<AIAdviceResult | null>(null);
    const [firstLoad, setFirstLoad]       = useState(true);
    const [refreshing, setRefreshing]     = useState(false);

    // History for sparklines
    const [outHist, setOutHist]           = useState<number[]>([]);
    const [effHist, setEffHist]           = useState<number[]>([]);
    const [savHist, setSavHist]           = useState<number[]>([]);
    const [tmpHist, setTmpHist]           = useState<number[]>([]);

    // Toast
    const [toast, setToast]               = useState({ visible: false, msg: '' });
    const firstFetch                       = useRef(true);

    // M6: Live clock
    const [clock, setClock]               = useState('');
    const [notifOn, setNotifOn]           = useState(false);

    // ── Live clock (M6) ─────────────────────────────────────────
    useEffect(() => {
        const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // ── PDF export (C5) ─────────────────────────────────────────
    const exportPDF = useCallback(() => window.print(), []);

    // ── Push notifications (C6) ─────────────────────────────────
    const toggleNotif = useCallback(async () => {
        if (!('Notification' in window)) return;
        if (notifOn) { setNotifOn(false); return; }
        const p = await Notification.requestPermission();
        if (p === 'granted') { setNotifOn(true); setToast({ visible: true, msg: '🔔 Push alerts enabled' }); }
    }, [notifOn]);

    // ── Weather polling ──────────────────────────────────────────
    useEffect(() => {
        if (disableLiveWeather) return;
        firstFetch.current = true;

        const fetch_ = async () => {
            try {
                const d = await getWeatherData(location);
                setWeather(d);
                if (!firstFetch.current) {
                    setToast({ visible: true, msg: `🛰 ${d.temperature.toFixed(1)}°C · ☀️ ${d.solar_index.toFixed(0)}% solar · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` });
                    if (notifOn && Notification.permission === 'granted') {
                        new Notification('WattWise', {
                            body: `📍 ${location.split(',')[0]} · ☀️ ${d.solar_index.toFixed(0)}% solar · 🌡 ${d.temperature.toFixed(1)}°C`,
                            icon: '/favicon.ico',
                        });
                    }
                }
                firstFetch.current = false;
            } catch (e) { console.error(e); }
        };

        fetch_();
        const id = setInterval(fetch_, REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, [location, disableLiveWeather, notifOn]);

    // ── Predictions ──────────────────────────────────────────────
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const run = async () => {
            try {
                if (!firstLoad) setRefreshing(true);
                const t  = expMode ? simTemp  : (weather?.temperature  ?? 28);
                const cl = expMode ? simCloud : (weather ? 100 - weather.solar_index : 30);
                const h  = expMode ? simHum   : (weather?.humidity ?? 65);

                const p = await getPrediction({ temperature: t, cloud_cover: cl, humidity: h, panel_capacity: panelKw, day_of_year: getCurrentDayOfYear() });
                setPred(p);
                setFirstLoad(false);

                const sav = p.total_daily_output * rate;
                setOutHist(x => [...x.slice(-(HIST-1)), p.total_daily_output]);
                setEffHist(x => [...x.slice(-(HIST-1)), p.efficiency_percent]);
                setSavHist(x => [...x.slice(-(HIST-1)), sav]);
                setTmpHist(x => [...x.slice(-(HIST-1)), t]);

                try {
                    const a = await getAIAdvice({ solar_efficiency: p.efficiency_percent, temperature: t, cloud_cover: cl, daily_output: p.total_daily_output });
                    setAdvice(a);
                } catch {}
            } catch (e) { console.error(e); }
            finally { setRefreshing(false); }
        };
        if (weather || expMode) run();
    }, [weather, expMode, simTemp, simCloud, simHum, panelKw, rate]);

    // ── Derived ──────────────────────────────────────────────────
    const aTemp   = expMode ? simTemp  : (weather?.temperature  ?? 28);
    const aCloud  = expMode ? simCloud : (weather ? 100 - weather.solar_index : 30);
    const aHum    = expMode ? simHum   : (weather?.humidity ?? 65);
    const savings = pred ? pred.total_daily_output * rate : 0;
    const eff     = pred ? getEfficiencyStatus(pred.efficiency_percent) : null;
    const score   = weather ? Math.round(weather.solar_index) : 0;
    const accent  = expMode ? 'var(--amber)' : 'var(--blue)';

    // ── Render ───────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Toast */}
            <Toast message={toast.msg} icon="🛰️" visible={toast.visible} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />

            {/* Refreshing indicator */}
            {refreshing && (
                <div className="print:hidden" style={{
                    position: 'fixed', top: 66, right: 20, zIndex: 50,
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'var(--raised)', border: '1px solid var(--b2)',
                    fontSize: 12, fontWeight: 500, color: 'var(--green-bright)',
                }}>
                    <div className="live-dot" style={{ width: 5, height: 5 }} />
                    Updating…
                </div>
            )}

            {/* ── M6: System Status Bar ───────────────────────── */}
            <div className="card fade-in" style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    {/* Left: status items */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div className="live-dot" />
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-bright)' }}>All Systems Operational</span>
                        </div>
                        <div style={{ width: 1, height: 16, background: 'var(--b1)' }} />
                        <div style={{ fontSize: 12, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>
                            🕐 {clock}
                        </div>
                        <div style={{ width: 1, height: 16, background: 'var(--b1)' }} />
                        <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                            Mode: <span style={{ color: expMode ? 'var(--amber-bright)' : 'var(--green-bright)', fontWeight: 600 }}>
                                {expMode ? 'Simulation' : 'Live'}
                            </span>
                        </div>
                        {weather && (
                            <>
                                <div style={{ width: 1, height: 16, background: 'var(--b1)' }} />
                                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                                    📍 {location.split(',')[0]}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Right: actions */}
                    <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={toggleNotif} className="btn btn-secondary" style={{ fontSize: 12 }}>
                            {notifOn ? '🔔 Alerts On' : '🔕 Alerts Off'}
                        </button>
                        <button onClick={exportPDF} className="btn btn-secondary" style={{ fontSize: 12 }}>
                            🖨 Export PDF
                        </button>
                        {pred && (
                            <span className="badge badge-blue" style={{ fontSize: 11 }}>
                                ⚡ {pred.total_daily_output.toFixed(1)} kWh today
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Page header ─────────────────────────────────── */}
            <div className="stagger-1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--t1)', lineHeight: 1.1 }}>
                        Solar <span className="text-gradient">Intelligence</span> Dashboard
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 5, fontWeight: 400 }}>
                        AI-powered forecasting · Real-time weather data · Financial optimization · India-wide
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral">⚡ {panelKw} kW System</span>
                    <span className="badge badge-neutral">₹{rate}/kWh</span>
                    <span className="badge badge-green">
                        <span className="live-dot" style={{ width: 5, height: 5 }} />
                        {expMode ? 'Simulation' : 'Live Data'}
                    </span>
                </div>
            </div>

            {/* ── Location selector ─────────────────────────────── */}
            <div className="stagger-2">
                <LocationSelector selectedLocation={location} onLocationChange={setLocation} />
            </div>

            {/* ── Live weather ──────────────────────────────────── */}
            {!disableLiveWeather && (
                <div className="stagger-3">
                    <WeatherTicker weather={weather} location={location} />
                </div>
            )}

            {/* ── Experiment controls ───────────────────────────── */}
            {showExperimentControls && (
                <div className="stagger-3">
                    <ExperimentControls
                        experimentMode={expMode}       onExperimentModeChange={setExpMode}
                        simTemp={simTemp}              onSimTempChange={setSimTemp}
                        simCloud={simCloud}            onSimCloudChange={setSimCloud}
                        simHumidity={simHum}           onSimHumidityChange={setSimHum}
                        panelCapacity={panelKw}        onPanelCapacityChange={setPanelKw}
                        electricityRate={rate}         onElectricityRateChange={setRate}
                    />
                </div>
            )}

            {/* ── Initial loading skeleton ──────────────────────── */}
            {firstLoad && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} className="card" style={{ padding: 20, height: 120 }}>
                                <div style={{ height: 10, width: '40%', borderRadius: 6, background: 'var(--raised)', marginBottom: 16 }} />
                                <div style={{ height: 28, width: '65%', borderRadius: 6, background: 'var(--raised)', marginBottom: 10 }} />
                                <div style={{ height: 10, width: '50%', borderRadius: 6, background: 'var(--raised)' }} />
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 12 }}>⚡</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>Initialising ML Models</div>
                        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Fetching live weather · Running predictions · Loading AI advisor…</div>
                    </div>
                </div>
            )}

            {/* ══ MAIN CONTENT ════════════════════════════════════ */}
            {!firstLoad && pred && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Row 1: 4 metric cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
                        <MetricCard
                            label="Temperature"
                            value={`${aTemp.toFixed(1)}°C`}
                            delta={`${aHum.toFixed(0)}% humidity · ${aCloud.toFixed(0)}% cloud`}
                            status={expMode ? 'simulation' : 'live'}
                            color={accent} accentColor={accent}
                            staggerIndex={0}
                            trend={tmpHist} trendLabel="Temp trend"
                        />
                        <MetricCard
                            label="Daily Output"
                            value={`${pred.total_daily_output.toFixed(2)} kWh`}
                            delta={`Peak ${pred.peak_output.toFixed(2)} kWh/hr @ ${pred.peak_hour}:00`}
                            status={expMode ? 'simulation' : 'live'}
                            color="var(--amber)" accentColor="var(--amber)"
                            staggerIndex={1}
                            trend={outHist} trendLabel="Output trend"
                        />
                        <MetricCard
                            label="Est. Savings Today"
                            value={formatCurrency(savings)}
                            delta={`₹${rate}/kWh · ${formatCurrency(savings * 30)}/month`}
                            status={expMode ? 'simulation' : 'live'}
                            color="var(--green)" accentColor="var(--green)"
                            staggerIndex={2}
                            trend={savHist} trendLabel="Savings trend"
                        />
                        <MetricCard
                            label="Efficiency"
                            value={eff ? `${eff.emoji} ${eff.text}` : '—'}
                            delta={`${pred.efficiency_percent.toFixed(1)}% of theoretical max`}
                            status={expMode ? 'simulation' : 'live'}
                            color={pred.efficiency_percent >= 70 ? 'var(--green)' : pred.efficiency_percent >= 40 ? 'var(--amber)' : 'var(--red)'}
                            accentColor={pred.efficiency_percent >= 70 ? 'var(--green)' : pred.efficiency_percent >= 40 ? 'var(--amber)' : 'var(--red)'}
                            statusClass={eff?.color}
                            staggerIndex={3}
                            trend={effHist} trendLabel="Efficiency trend"
                        />
                    </div>

                    {/* Row 2: Solar Gauge + CO2 + annual stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                        <SolarGauge score={score} label="Solar Score" />
                        <CO2Card dailyOutputKwh={pred.total_daily_output} />

                        {/* M7: System summary card */}
                        <div className="card" style={{ padding: '18px 20px' }}>
                            <div style={{ marginBottom: 1, height: 1, position: 'absolute', top: 0, left: '10%', right: '10%', background: 'var(--blue)', opacity: 0.4, borderRadius: 99 }} />
                            <div className="section-label" style={{ marginBottom: 14 }}>System Summary</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Annual Projection',   value: formatCurrency(savings * 365), color: 'var(--amber-bright)' },
                                    { label: 'Monthly Savings',     value: formatCurrency(savings * 30),  color: 'var(--green-bright)' },
                                    { label: 'Panel Capacity',      value: `${panelKw} kW`,               color: 'var(--blue-bright)'  },
                                    { label: 'CO₂ Saved / Year',    value: `${(pred.total_daily_output * 0.82 * 365).toFixed(0)} kg`, color: 'var(--green-bright)' },
                                    { label: 'Trees Equiv. / Year', value: `${((pred.total_daily_output * 0.82 * 365) / 21).toFixed(0)} 🌳`, color: 'var(--green-bright)' },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--b1)' }}>
                                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>{r.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontVariantNumeric: 'tabular-nums' }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Chart + AI Advisor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>
                        <SolarCurveChart prediction={pred} />
                        <div id="ai-advisor">
                            <AIAdvicePanel advice={advice} />
                        </div>
                    </div>

                    {/* Row 4: Panel Health + Savings Goal */}
                    <div id="health goals" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div id="health">
                            <PanelHealthCard
                                temperature={aTemp} efficiency={pred.efficiency_percent}
                                cloudCover={aCloud}  humidity={aHum}
                                panelCapacity={panelKw}
                            />
                        </div>
                        <div id="goals">
                            <SavingsGoalCard dailySavings={savings} />
                        </div>
                    </div>

                    {/* Row 5: Battery Optimizer */}
                    <div id="battery">
                        <BatteryOptimization prediction={pred} electricityRate={rate} />
                    </div>

                    {/* Row 6: Data footer strip */}
                    <div className="card" style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                                {[
                                    { l: 'Location',     v: location.split(',')[0], c: 'var(--t1)' },
                                    { l: 'Data Source',  v: expMode ? 'Simulation' : 'Live API', c: expMode ? 'var(--amber-bright)' : 'var(--green-bright)' },
                                    { l: 'Refresh',      v: 'Every 2 sec', c: 'var(--t2)' },
                                    { l: 'Model',        v: 'ML v2.0', c: 'var(--blue-bright)' },
                                    { l: 'MoSCoW',       v: 'All tiers delivered', c: 'var(--t2)' },
                                ].map(f => (
                                    <div key={f.l} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <span style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.l}</span>
                                        <span style={{ fontWeight: 600, color: f.c }}>{f.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--t3)' }}>
                                <div className="live-dot" style={{ width: 5, height: 5 }} />
                                Last updated: {clock}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
