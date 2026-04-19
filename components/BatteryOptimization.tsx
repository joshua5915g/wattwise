'use client';

import React, { useState } from 'react';
import type { PredictionResult } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
    prediction: PredictionResult;
    electricityRate: number;
}

export default function BatteryOptimization({ prediction, electricityRate }: Props) {
    const [batteryCapacity, setBatteryCapacity] = useState(5.0); // Default 5kWh

    // Basic calculation model:
    // Assume 30% of daily output is used instantly by the house during the day.
    // The rest (70%) is "excess" and can be stored in the battery.
    const instantUsagePercent = 0.30;
    const excessEnergy = prediction.total_daily_output * (1 - instantUsagePercent);
    const storedEnergy = Math.min(excessEnergy, batteryCapacity);
    
    // Night savings from stored energy
    const nightSavings = storedEnergy * electricityRate;

    // Grid reliance offset
    // How much of a 15kWh daily home consumption does this battery cover?
    const averageHomeConsumptionDaily = 15.0; // kWh
    const offsetPercentage = Math.min(100, (storedEnergy / averageHomeConsumptionDaily) * 100);

    return (
        <div className="glass-card p-6 mt-4 fade-in">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">🔋</span>
                Battery Storage Optimization
            </h2>
            <p className="text-text-secondary text-sm mb-6">
                Simulate how much excess solar energy you can store for night-time usage and calculate additional savings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-4">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-text-primary mb-2">
                            <span>Battery Capacity</span>
                            <span className="text-primary">{batteryCapacity.toFixed(1)} kWh</span>
                        </label>
                        <input
                            type="range"
                            min="1.0"
                            max="20.0"
                            step="0.5"
                            value={batteryCapacity}
                            onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
                            className="range gap-4 max-w-[300px]"
                        />
                    </div>
                    <div className="text-sm text-text-secondary">
                        <ul className="space-y-1 list-disc pl-4">
                            <li><span className="text-white">Excess Solar Energy:</span> {excessEnergy.toFixed(1)} kWh</li>
                            <li><span className="text-white">Energy Stored:</span> <span className="text-primary font-bold">{storedEnergy.toFixed(1)} kWh</span></li>
                        </ul>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col justify-center space-y-4 bg-background-dark/30 p-4 rounded-xl border border-white/5">
                    <div>
                        <span className="text-sm text-text-secondary block">Extra Night-time Savings</span>
                        <span className="text-2xl font-bold text-[#00ff88]">
                            +{formatCurrency(nightSavings)}/day
                        </span>
                    </div>
                    <div>
                        <span className="text-sm text-text-secondary block">Nightly Grid Offset (%)</span>
                        <div className="flex items-center mt-1">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${offsetPercentage}%` }}
                                />
                            </div>
                            <span className="text-white font-bold text-sm ml-3 w-12 text-right">
                                {offsetPercentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
