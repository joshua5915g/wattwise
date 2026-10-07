'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'wattwise-maintenance-log-v1';
const TASKS = [
    { id: 'visual-check', title: 'Visual panel and cable check', cadenceDays: 30 },
    { id: 'panel-clean', title: 'Check whether panels need cleaning', cadenceDays: 45 },
    { id: 'inverter-check', title: 'Review inverter status and alerts', cadenceDays: 90 },
    { id: 'installer-service', title: 'Schedule professional system inspection', cadenceDays: 365 },
];

type CompletionLog = Record<string, string>;

function dueMessage(lastCompleted: string | undefined, cadenceDays: number) {
    if (!lastCompleted) return 'No completion recorded';
    const elapsedDays = Math.floor((Date.now() - new Date(lastCompleted).getTime()) / 86_400_000);
    if (!Number.isFinite(elapsedDays) || elapsedDays < 0) return 'Date needs review';
    const remaining = cadenceDays - elapsedDays;
    return remaining <= 0 ? 'Due now' : `Due in ${remaining} days`;
}

export default function SolarMaintenancePlanner() {
    const [completionLog, setCompletionLog] = useState<CompletionLog>({});
    const [ready, setReady] = useState(false);
    const [storageError, setStorageError] = useState('');

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: unknown = JSON.parse(saved);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    const normalized: CompletionLog = {};
                    Object.entries(parsed).forEach(([taskId, completedAt]) => {
                        if (TASKS.some((task) => task.id === taskId) && typeof completedAt === 'string' && Number.isFinite(Date.parse(completedAt))) {
                            normalized[taskId] = completedAt;
                        }
                    });
                    setCompletionLog(normalized);
                } else {
                    setStorageError('Saved maintenance data was invalid; edits will start a fresh log.');
                }
            }
        } catch {
            setStorageError('Maintenance history could not be read from this browser.');
        } finally {
            setReady(true);
        }
    }, []);

    const markComplete = (taskId: string) => {
        const next = { ...completionLog, [taskId]: new Date().toISOString() };
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setCompletionLog(next);
            setStorageError('');
        } catch {
            setStorageError('Could not save this update. Check browser storage settings and try again.');
        }
    };

    return (
        <section className="card" aria-labelledby="maintenance-title" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
                <div className="section-label">Preventive care</div>
                <h2 id="maintenance-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>Solar Maintenance Planner</h2>
                <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>A lightweight checklist saved in this browser. Follow your installer&apos;s guidance and equipment manual.</p>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
                {TASKS.map((task) => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '11px 12px', borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{task.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 3 }}>
                                {ready ? dueMessage(completionLog[task.id], task.cadenceDays) : 'Loading saved checklist…'}
                                {completionLog[task.id] && ` · Last done ${new Date(completionLog[task.id]).toLocaleDateString()}`}
                            </div>
                        </div>
                        <button type="button" className="btn btn-secondary" disabled={!ready} onClick={() => markComplete(task.id)} style={{ fontSize: 12 }}>
                            Mark complete
                        </button>
                    </div>
                ))}
            </div>
            {storageError && <p role="status" style={{ fontSize: 12, color: 'var(--amber-bright)' }}>{storageError}</p>}
        </section>
    );
}
