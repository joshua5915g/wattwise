import Dashboard from '@/components/Dashboard';
import Link from 'next/link';

export default function Home() {
    return (
        <>
            {/* Page header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, paddingBottom: 20,
                borderBottom: '1px solid var(--b1)',
                flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 4 }}>
                        Live Mode
                    </div>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em' }}>
                        Solar Intelligence Dashboard
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 3 }}>
                        Real-time weather · AI forecasting · Financial optimisation
                    </p>
                </div>
                <Link
                    href="/experiment"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                        background: 'var(--b3)', border: '1px solid var(--b1)',
                        color: 'var(--t2)', textDecoration: 'none',
                    }}
                >
                    🧪 Experiment Mode →
                </Link>
            </div>

            <Dashboard />
        </>
    );
}
