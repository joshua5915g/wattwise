'use client';

interface SparklineChartProps {
    data: number[];
    color?: string;
    height?: number;
    width?: number;
    showDots?: boolean;
}

export default function SparklineChart({
    data,
    color = '#f59e0b',
    height = 44,
    width = 120,
    showDots = false,
}: SparklineChartProps) {
    if (!data || data.length < 2) {
        return (
            <div
                className="animate-pulse rounded"
                style={{ width, height, background: 'rgba(255,255,255,0.04)' }}
            />
        );
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 3;

    const pts = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (width - pad * 2),
        y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }));

    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${pts[0].x},${height} ${polyline} ${pts[pts.length - 1].x},${height}`;

    // trend direction
    const trend = data[data.length - 1] >= data[0];
    const gradId = `sg-${color.replace(/[^a-z0-9]/gi, '')}-${Math.random().toString(36).slice(2, 6)}`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <polygon points={area} fill={`url(#${gradId})`} />

            {/* Line */}
            <polyline
                points={polyline}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots on each point */}
            {showDots && pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} opacity="0.6" />
            ))}

            {/* Last point — bigger dot */}
            <circle
                cx={pts[pts.length - 1].x}
                cy={pts[pts.length - 1].y}
                r="3"
                fill={color}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />

            {/* Trend arrow */}
            <text
                x={width - 2}
                y={8}
                textAnchor="end"
                fontSize="8"
                fill={trend ? '#10b981' : '#f87171'}
                fontFamily="Inter, sans-serif"
                fontWeight="700"
            >
                {trend ? '▲' : '▼'}
            </text>
        </svg>
    );
}
