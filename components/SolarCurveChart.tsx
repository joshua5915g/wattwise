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

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Hour,Predicted Output (kWh)\n";
        
        hourly_output.forEach((output, index) => {
            const hourFormatted = `${index.toString().padStart(2, '0')}:00`;
            csvContent += `${hourFormatted},${output}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wattwise_solar_prediction.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    return (
        <div className="glass-card p-6 min-h-[400px] relative">
            <div className="w-full flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white h-0 opacity-0 overflow-hidden m-0 p-0 absolute">Solar</h3>
                <div />
                <button 
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary text-sm font-semibold rounded-lg transition-colors flex items-center border border-primary/30 z-10"
                >
                    <span className="mr-2">⬇</span> Download CSV
                </button>
            </div>
            <Plot
                data={[
                    {
                        x: hourLabels,
                        y: prediction.hourly_output,
                        type: 'scatter',
                        mode: 'lines',
                        fill: 'tozeroy',
                        fillcolor: 'rgba(0, 255, 136, 0.3)',
                        line: { color: '#00ff88', width: 3 },
                        hovertemplate: '<b>%{x}</b><br>Output: %{y:.2f} kWh<extra></extra>',
                    },
                ]}
                layout={{
                    title: {
                        text: '⚡ Daily Solar Output Curve',
                        font: { color: '#ffffff', size: 16, family: 'Inter' },
                        x: 0,
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { family: 'Inter', color: '#a0a0a0' },
                    xaxis: {
                        title: 'Hour of Day',
                        showgrid: false,
                        zeroline: false,
                        color: '#a0a0a0',
                        tickangle: -45,
                    },
                    yaxis: {
                        title: 'Energy Output (kWh)',
                        showgrid: false,
                        zeroline: false,
                        color: '#a0a0a0',
                    },
                    height: 350,
                    margin: { l: 60, r: 30, t: 60, b: 80 },
                    showlegend: false,
                    hovermode: 'x unified',
                    annotations: [
                        {
                            x: hourLabels[prediction.peak_hour],
                            y: prediction.peak_output,
                            text: `Peak: ${prediction.peak_output.toFixed(2)} kWh`,
                            showarrow: true,
                            arrowhead: 2,
                            arrowcolor: '#00ff88',
                            font: { color: '#00ff88', size: 12 },
                            bgcolor: 'rgba(10, 10, 15, 0.9)',
                            bordercolor: '#00ff88',
                            borderwidth: 1,
                            borderpad: 4,
                        },
                    ],
                }}
                config={{ displayModeBar: false }}
                className="w-full"
            />
        </div>
    );
}
