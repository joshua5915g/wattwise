import type { WeatherData } from '@/lib/types';

interface WeatherTickerProps {
    weather: WeatherData | null;
    location: string;
}

export default function WeatherTicker({ weather, location }: WeatherTickerProps) {
    if (!weather) {
        return (
            <div className="glass-card p-4 animate-pulse">
                <div className="h-8 bg-white/5 rounded"></div>
            </div>
        );
    }

    const currentTime = new Date(weather.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/20 border border-neon-green/40 rounded-full">
                        <div className="live-dot"></div>
                        <span className="text-neon-green text-xs font-semibold uppercase tracking-wider">
                            Live Weather
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">📍 Location</span>
                        <span className="text-neon-green font-semibold">{location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">🌡️ Temp</span>
                        <span className="text-neon-green font-semibold">{weather.temperature.toFixed(1)}°C</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">💧 Humidity</span>
                        <span className="text-neon-green font-semibold">{weather.humidity.toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">☀️ UV Index</span>
                        <span className="text-neon-green font-semibold">{weather.uv_index.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">💨 Wind</span>
                        <span className="text-neon-green font-semibold">{weather.wind_speed.toFixed(0)} km/h</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">⚡ Solar</span>
                        <span className="text-neon-green font-semibold">{weather.solar_index.toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs uppercase tracking-wider">🕒 Updated</span>
                        <span className="text-neon-green font-semibold">{currentTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
