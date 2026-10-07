'use client';

import { useEffect, useState } from 'react';

interface SolarYieldAlertsProps {
    dailyOutputKwh: number;
    location: string;
}

export default function SolarYieldAlerts({ dailyOutputKwh, location }: SolarYieldAlertsProps) {
    const [thresholdKwh, setThresholdKwh] = useState(8);
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            setEnabled(true);
        }
    }, []);

    useEffect(() => {
        if (!enabled || dailyOutputKwh > thresholdKwh || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const today = new Date().toISOString().slice(0, 10);
        const locationKey = location.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const storageKey = `wattwise-solar-yield-alert-${locationKey}-${today}`;

        try {
            if (window.localStorage.getItem(storageKey)) return;
            new Notification('WattWise low solar forecast', {
                body: `${location}: forecast generation is ${dailyOutputKwh.toFixed(1)} kWh, below your ${thresholdKwh} kWh alert.`,
                icon: '/favicon.ico',
            });
            window.localStorage.setItem(storageKey, 'sent');
            setMessage('Low-generation alert sent for today.');
        } catch {
            setMessage('Could not send or save the alert. Check browser notification and storage permissions.');
        }
    }, [dailyOutputKwh, enabled, location, thresholdKwh]);

    const enableAlerts = async () => {
        if (typeof Notification === 'undefined') {
            setMessage('This browser does not support desktop notifications.');
            return;
        }
        try {
            const permission = await Notification.requestPermission();
            setEnabled(permission === 'granted');
            setMessage(permission === 'granted' ? 'Low-generation alerts are enabled.' : 'Notification permission was not granted.');
        } catch {
            setMessage('Could not request notification permission in this browser.');
        }
    };

    return (
        <section className="card" aria-labelledby="yield-alerts-title" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div className="section-label">Personalized monitoring</div>
                    <h2 id="yield-alerts-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Low Solar Yield Alerts</h2>
                    <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Get one browser notification per day and location when the current forecast falls below your limit.</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={enableAlerts} style={{ fontSize: 12 }}>
                    {enabled ? '🔔 Alerts enabled' : 'Enable browser alerts'}
                </button>
            </div>
            <label style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) auto', alignItems: 'center', gap: 12, color: 'var(--t2)', fontSize: 12 }}>
                <span>Notify below daily generation forecast</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <input aria-label="Low solar yield alert threshold in kilowatt-hours" type="number" min="0" max="100" step="0.5" value={thresholdKwh} onChange={(event) => setThresholdKwh(Math.max(0, Math.min(100, Number(event.target.value) || 0)))} style={{ width: 86, padding: '7px 8px', borderRadius: 8, background: 'var(--raised)', border: '1px solid var(--b1)', color: 'var(--t1)' }} />
                    <span>kWh</span>
                </span>
            </label>
            <div role="status" style={{ fontSize: 12, color: dailyOutputKwh <= thresholdKwh ? 'var(--amber-bright)' : 'var(--green-bright)' }}>
                Current forecast for {location.split(',')[0]}: {dailyOutputKwh.toFixed(1)} kWh — {dailyOutputKwh <= thresholdKwh ? 'below threshold' : 'within your target'}.
            </div>
            {message && <p role="status" style={{ fontSize: 11, color: 'var(--t3)' }}>{message}</p>}
        </section>
    );
}
