import type { EfficiencyStatus } from './types';
import { EFFICIENCY_THRESHOLDS } from './constants';

export function getEfficiencyStatus(efficiency: number): {
    status: EfficiencyStatus;
    text: string;
    emoji: string;
    color: string;
} {
    if (efficiency >= EFFICIENCY_THRESHOLDS.HIGH) {
        return {
            status: 'high',
            text: 'HIGH',
            emoji: '🟢',
            color: 'status-high',
        };
    } else if (efficiency >= EFFICIENCY_THRESHOLDS.MEDIUM) {
        return {
            status: 'medium',
            text: 'MODERATE',
            emoji: '🟡',
            color: 'status-medium',
        };
    } else {
        return {
            status: 'low',
            text: 'LOW',
            emoji: '🔴',
            color: 'status-low',
        };
    }
}

export function formatCurrency(amount: number): string {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatNumber(num: number, decimals: number = 1): string {
    return num.toFixed(decimals);
}

export function getCurrentDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

export function getTimeEmoji(hour: number): string {
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 20) return '🌇';
    return '🌙';
}
