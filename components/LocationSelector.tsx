'use client';

import { LOCATIONS } from '@/lib/constants';

interface LocationSelectorProps {
    selectedLocation: string;
    onLocationChange: (location: string) => void;
}

export default function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
    const locationOptions = Object.keys(LOCATIONS);

    // Group cities by state
    const grouped: Record<string, string[]> = {};
    locationOptions.forEach(loc => {
        const state = loc.includes(',') ? loc.split(',').slice(1).join(',').trim() : 'Other';
        if (!grouped[state]) grouped[state] = [];
        grouped[state].push(loc);
    });

    return (
        <div style={{ position: 'relative' }}>
            {/* Icon */}
            <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--blue-dim)', border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, pointerEvents: 'none', zIndex: 1,
            }}>
                📍
            </div>

            {/* Label */}
            <div style={{
                position: 'absolute', left: 62, top: 12,
                fontSize: 10, fontWeight: 500, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--t3)', pointerEvents: 'none', zIndex: 1,
            }}>
                Location
            </div>

            {/* Native select — always works, cannot be clipped */}
            <select
                id="location-selector-btn"
                value={selectedLocation}
                onChange={e => onLocationChange(e.target.value)}
                style={{
                    width: '100%',
                    paddingTop: 30,
                    paddingBottom: 12,
                    paddingLeft: 62,
                    paddingRight: 44,
                    background: 'var(--surface)',
                    border: '1px solid var(--b1)',
                    borderRadius: 'var(--r-lg)',
                    color: 'var(--t1)',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                    e.currentTarget.style.background = 'var(--raised)';
                }}
                onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--b1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'var(--surface)';
                }}
            >
                {Object.entries(grouped).map(([state, cities]) => (
                    <optgroup key={state} label={state}
                        style={{ background: '#1C1C28', color: '#9898A6', fontWeight: 600 }}
                    >
                        {cities.map(loc => (
                            <option key={loc} value={loc}
                                style={{ background: '#1C1C28', color: '#F1F1F3', fontWeight: 400, padding: '6px 0' }}
                            >
                                {loc.split(',')[0].trim()}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            {/* Custom chevron arrow */}
            <div style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                    background: 'var(--blue-dim)', border: '1px solid rgba(59,130,246,0.2)',
                    color: 'var(--blue-bright)',
                }}>
                    {locationOptions.length} cities
                </span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round"
                    style={{ color: 'var(--t3)' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    );
}
