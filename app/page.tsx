import Dashboard from '@/components/Dashboard';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
                <h1 className="text-4xl font-bold text-white mb-3">WattWise Solar Dashboard</h1>
                <p className="text-sm text-slate-300 mb-4">
                    View live weather predictions and solar panel performance in real time.
                    For controlled scenario testing, use the dedicated experiment page.
                </p>
                <Link
                    href="/experiment"
                    className="inline-flex rounded-full bg-neon-green px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-neon-green/90"
                >
                    Go to Experiment Mode
                </Link>
            </div>
            <Dashboard />
        </main>
    );
}
