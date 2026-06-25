import Dashboard from '@/components/Dashboard';

export default function ExperimentPage() {
    return (
        <>
            <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                marginBottom: 24, paddingBottom: 20,
                borderBottom: '1px solid var(--b1)',
                flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 4 }}>
                        🧪 Experiment Mode
                    </div>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em' }}>
                        Simulation &amp; Scenario Testing
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Adjust weather conditions manually · Compare outputs · Optimise panel configuration
                    </p>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.3)',
                    color: 'var(--amber-bright)',
                }}>
                    ⚠ Live weather disabled in simulation mode
                </span>
            </div>

            <Dashboard initialExperimentMode showExperimentControls disableLiveWeather />
        </>
    );
}
