'use client';

import dynamic from 'next/dynamic';
import type { PredictionResult } from '@/lib/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SolarCurveChartProps {
    prediction: PredictionResult;
}

export default function SolarCurveChart({ prediction }: SolarCurveChartProps) {
    const handleDownloadCSV = () => {
        const { hourly_output } = prediction;
        if (!hourly_output || hourly_output.length === 0) return;
        let csv = 'Hour,Predicted Output (kWh)\n';
        hourly_output.forEach((output, i) => {
            csv += `${i.toString().padStart(2, '0')}:00,${output}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wattwise_solar_prediction.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    // Theoretical clear-sky reference (bell curve)
    const clearSky = hourLabels.map((_, i) => {
        const peakHour = 13;
        const spread = 5;
        const val = Math.exp(-0.5 * Math.pow((i - peakHour) / spread, 2));
        return parseFloat((val * (prediction.peak_output * 1.3)).toFixed(3));
    });

    return (
        <div className="glass-card p-6 min-h-[420px] relative overflow-hidden">
            <div
                className="metric-card-accent"
                style={{ background: 'linear-gradient(90deg, #f59e0b, rgba(6,182,212,0.5), transparent)' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="section-title">
                            ⚡ Solar Output Forecast
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            24-hour predicted generation curve
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-0.5 rounded" style={{ background: '#f59e0b' }} />
                            Predicted
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-0.5 rounded" style={{ background: 'rgba(6,182,212,0.5)', borderTop: '1px dashed #06b6d4' }} />
                            Clear sky
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        className="btn-primary text-xs px-3 py-2"
                        id="download-csv-btn"
                    >
                        ⬇ CSV
                    </button>
                </div>
            </div>

            <Plot
                data={[
                    // Clear-sky reference (dashed)
                    {
                        x: hourLabels,
                        y: clearSky,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Clear Sky',
                        line: {
                            color: 'rgba(6,182,212,0.4)',
                            width: 1.5,
                            dash: 'dot',
                        },
                        hovertemplate: '<b>%{x}</b><br>Clear sky: %{y:.2f} kWh<extra></extra>',
                    },
                    // Predicted output (filled)
                    {
                        x: hourLabels,
                        y: prediction.hourly_output,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Predicted',
                        fill: 'tozeroy',
                        fillcolor: 'rgba(245,158,11,0.12)',
                        line: {
                            color: '#f59e0b',
                            width: 3,
                            shape: 'spline',
                            smoothing: 0.8,
                        },
                        hovertemplate: '<b>%{x}</b><br>Output: <b>%{y:.2f} kWh</b><extra></extra>',
                    },
                ]}
                layout={{
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { family: 'Inter', color: '#6060a0', size: 11 },
                    xaxis: {
                        showgrid: true,
                        gridcolor: 'rgba(255,255,255,0.04)',
                        zeroline: false,
                        color: '#5050a0',
                        tickangle: -45,
                        tickfont: { size: 10 },
                    },
                    yaxis: {
                        title: { text: 'kWh', font: { size: 11 } },
                        showgrid: true,
                        gridcolor: 'rgba(255,255,255,0.04)',
                        zeroline: false,
                        color: '#5050a0',
                        tickfont: { size: 10 },
                    },
                    height: 330,
                    margin: { l: 48, r: 16, t: 10, b: 70 },
                    showlegend: false,
                    hovermode: 'x unified',
                    hoverlabel: {
                        bgcolor: 'rgba(13,13,31,0.95)',
                        bordercolor: 'rgba(245,158,11,0.4)',
                        font: { family: 'Inter', color: '#f0f0ff', size: 12 },
                    },
                    annotations: [
                        {
                            x: hourLabels[prediction.peak_hour],
                            y: prediction.peak_output,
                            text: `⚡ Peak ${prediction.peak_output.toFixed(2)} kWh`,
                            showarrow: true,
                            arrowhead: 0,
                            arrowcolor: '#f59e0b',
                            arrowwidth: 1.5,
                            ax: 0,
                            ay: -40,
                            font: { color: '#fbbf24', size: 11, family: 'Space Grotesk' },
                            bgcolor: 'rgba(13,13,31,0.9)',
                            bordercolor: 'rgba(245,158,11,0.4)',
                            borderwidth: 1,
                            borderpad: 6,
                        },
                    ],
                }}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
            />
        </div>
    );
}
