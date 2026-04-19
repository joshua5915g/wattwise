import { LOCATIONS } from '@/lib/constants';

interface LocationSelectorProps {
    selectedLocation: string;
    onLocationChange: (location: string) => void;
}

export default function LocationSelector({
    selectedLocation,
    onLocationChange,
}: LocationSelectorProps) {
    const locationOptions = Object.keys(LOCATIONS);

    return (
        <div className="glass-card p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-2 block">
                📍 Select Location
            </label>
            <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-green transition-colors"
            >
                {locationOptions.map((location) => (
                    <option key={location} value={location} className="bg-bg-secondary text-white">
                        {location}
                    </option>
                ))}
            </select>
        </div>
    );
}
