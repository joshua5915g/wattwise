import Dashboard from '@/components/Dashboard';

export default function ExperimentPage() {
    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
                <h1 className="text-4xl font-bold text-white mb-3">Experiment Mode</h1>
                <p className="text-sm text-slate-300 mb-4">
                    This page is dedicated to controlled scenario testing. Use the simulation controls below to experiment with weather conditions and compare output.
                </p>
            </div>
            <Dashboard initialExperimentMode showExperimentControls disableLiveWeather />
        </main>
    );
}
