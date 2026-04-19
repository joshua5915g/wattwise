import type { AIAdviceResult } from '@/lib/types';

interface AIAdvicePanelProps {
    advice: AIAdviceResult | null;
}

export default function AIAdvicePanel({ advice }: AIAdvicePanelProps) {
    if (!advice) {
        return (
            <div className="glass-card p-6 h-full">
                <div className="text-neon-green text-xs font-semibold uppercase tracking-wider mb-3">
                    🤖 AI Energy Advisor
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="text-neon-green text-xs font-semibold uppercase tracking-wider mb-4">
                🤖 AI Energy Advisor
            </div>
            <div className="flex-1 space-y-4">
                <p className="text-white text-sm leading-relaxed">{advice.advice}</p>

                {advice.appliance_recommendations && advice.appliance_recommendations.length > 0 && (
                    <div>
                        <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
                            Recommended Appliances
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {advice.appliance_recommendations.map((appliance, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-full text-neon-green text-xs"
                                >
                                    {appliance}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {advice.optimal_hours && (
                    <div>
                        <div className="text-text-secondary text-xs uppercase tracking-wider mb-1">
                            Optimal Hours
                        </div>
                        <div className="text-neon-green font-semibold">{advice.optimal_hours}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
