interface MetricCardProps {
    label: string;
    value: string;
    delta?: string;
    status?: string;
    color?: string;
    statusClass?: string;
}

export default function MetricCard({
    label,
    value,
    delta,
    status,
    color = '#00ff88',
    statusClass,
}: MetricCardProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="metric-label">{label}</div>
                {status && (
                    <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color }}
                    >
                        ● {status}
                    </span>
                )}
            </div>
            <div className={`text-3xl font-bold ${statusClass || 'neon-text'}`}>
                {value}
            </div>
            {delta && <div className="metric-delta mt-2">{delta}</div>}
        </div>
    );
}
