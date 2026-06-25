import type { AIAdviceResult } from '@/lib/types';

interface AIAdvicePanelProps {
    advice: AIAdviceResult | null;
}

export default function AIAdvicePanel({ advice }: AIAdvicePanelProps) {
    return (
        <div id="ai-advisor" className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
            <div
                className="metric-card-accent"
                style={{ background: 'linear-gradient(90deg, #06b6d4, transparent)' }}
            />

            {/* Background decoration */}
            <div
                className="absolute top-3 right-3 text-6xl opacity-[0.05] select-none pointer-events-none"
            >
                🤖
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))',
                        border: '1px solid rgba(6,182,212,0.3)',
                        boxShadow: '0 0 20px rgba(6,182,212,0.15)',
                    }}
                >
                    🤖
                </div>
                <div>
                    <div className="font-display font-semibold text-white text-sm">AI Energy Advisor</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="live-dot" style={{ background: '#06b6d4', boxShadow: '0 0 6px rgba(6,182,212,0.8)' }} />
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: '#06b6d4' }}>
                            AI Analysis Active
                        </span>
                    </div>
                </div>
            </div>

            {!advice ? (
                <div className="flex-1 space-y-3">
                    {/* Skeleton with typing feel */}
                    {[80, 100, 65, 90, 70].map((w, i) => (
                        <div
                            key={i}
                            className="h-3 rounded-full animate-pulse"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                width: `${w}%`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                    <div className="pt-4 space-y-2">
                        <div className="h-2 rounded-full animate-pulse w-1/2" style={{ background: 'rgba(6,182,212,0.1)', animationDelay: '0.5s' }} />
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-7 w-20 rounded-full animate-pulse" style={{ background: 'rgba(6,182,212,0.06)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 space-y-5">
                    {/* Advice text */}
                    <div
                        className="p-4 rounded-xl text-sm leading-relaxed"
                        style={{
                            background: 'rgba(6,182,212,0.04)',
                            border: '1px solid rgba(6,182,212,0.1)',
                            color: 'rgba(240,240,255,0.85)',
                            lineHeight: '1.7',
                        }}
                    >
                        {advice.advice}
                    </div>

                    {/* Optimal hours */}
                    {advice.optimal_hours && (
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                                ⏰ Optimal Hours
                            </div>
                            <div
                                className="text-sm font-semibold px-3 py-2 rounded-xl inline-block"
                                style={{
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                    color: '#fbbf24',
                                }}
                            >
                                {advice.optimal_hours}
                            </div>
                        </div>
                    )}

                    {/* Appliance recommendations */}
                    {advice.appliance_recommendations && advice.appliance_recommendations.length > 0 && (
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                                🔌 Recommended Appliances
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {advice.appliance_recommendations.map((appliance, idx) => (
                                    <span key={idx} className="badge badge-cyan">
                                        {appliance}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
