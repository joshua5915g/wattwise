import { NextRequest, NextResponse } from 'next/server';

interface WattBotRequest {
    message: string;
    context?: {
        location?: string;
        panelKw?: number;
        dailyOutputKwh?: number;
        efficiencyPercent?: number;
        temperature?: number;
        cloudCover?: number;
        electricityRate?: number;
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: WattBotRequest = await req.json();
        const { message, context } = body;

        const q = (message || '').toLowerCase();
        const loc = context?.location || 'India';
        const panel = context?.panelKw || 3;
        const daily = context?.dailyOutputKwh || 12;
        const eff = context?.efficiencyPercent || 75;
        const temp = context?.temperature || 28;
        const cloud = context?.cloudCover || 20;
        const rate = context?.electricityRate || 8;

        let reply = '';
        const suggestions: string[] = [];

        if (q.includes('low') || q.includes('efficiency') || q.includes('drop') || q.includes('dip')) {
            if (cloud > 40) {
                reply = `☁️ Your current efficiency is ${eff.toFixed(1)}% primarily due to high cloud cover (${cloud.toFixed(0)}%) in ${loc.split(',')[0]}. Clouds scatter direct sunlight, reducing output. When skies clear up, output will bounce back to ~${(panel * 4.5).toFixed(1)} kWh.`;
            } else if (temp > 35) {
                reply = `🌡️ High ambient temperature (${temp.toFixed(1)}°C) is causing thermal derating on your ${panel} kW PV panels. Silicon solar cells lose ~0.4% efficiency for every degree above 25°C. Rooftop ventilation and evening panel washing help keep temperatures lower.`;
            } else {
                reply = `⚡ Your current system efficiency is ${eff.toFixed(1)}% in ${loc.split(',')[0]}. To boost generation, check for early morning shadow obstruction from trees, inverter clipping, or dust accumulation on the top glass.`;
            }
            suggestions.push('How often should I clean panels?', 'When is peak solar today?');
        } else if (q.includes('ev') || q.includes('charge') || q.includes('car') || q.includes('scooter') || q.includes('appliance') || q.includes('washing')) {
            reply = `🚗 For your ${panel} kW system in ${loc.split(',')[0]}, the optimal zero-cost charging window is between **11:00 AM and 2:30 PM**. Running your EV charger (approx 2.5 - 3.3 kW) during these peak irradiance hours ensures 100% solar self-consumption without drawing expensive grid electricity!`;
            suggestions.push('How much do I save with net metering?', 'What about battery storage?');
        } else if (q.includes('subsidy') || q.includes('surya') || q.includes('pm') || q.includes('scheme') || q.includes('cost')) {
            const subsidyVal = panel <= 1 ? '₹30,000' : panel <= 2 ? '₹60,000' : '₹78,000';
            reply = `🏛️ Under the national **PM Surya Ghar: Muft Bijli Yojana**, your ${panel} kW residential rooftop system qualifies for a central financial subsidy of **${subsidyVal}**. This reduces your payback period to under **3.5 years** at ₹${rate}/kWh electricity rate!`;
            suggestions.push('What is the 25-year ROI?', 'Can I sell power back to grid?');
        } else if (q.includes('clean') || q.includes('dust') || q.includes('maintenance') || q.includes('wash')) {
            reply = `🧼 **Solar Cleaning Best Practices for ${loc.split(',')[0]}**:
1. Clean panels **early in the morning** (before 8 AM) or late evening to prevent thermal shock fractures.
2. Use soft demineralized water and a microfiber squeegee—avoid harsh abrasive detergents.
3. In urban/dusty areas, a bi-weekly rinse recovers 7% to 15% lost solar generation!`;
            suggestions.push('Why is my efficiency low today?', 'How to check panel health?');
        } else if (q.includes('battery') || q.includes('storage') || q.includes('power cut') || q.includes('blackout')) {
            const recommendedBattery = Math.round(panel * 1.5);
            reply = `🔋 For a ${panel} kW solar array generating ~${daily.toFixed(1)} kWh/day, a **${recommendedBattery} kWh LiFePO4 battery** is ideal. This stores surplus midday energy to power your home through evening peak tariff hours and 4-6 hours of grid blackouts.`;
            suggestions.push('When is the best time to charge my EV?', 'Explain PM Surya Ghar subsidy');
        } else {
            reply = `👋 Hi! I'm **WattBot**, your AI Solar Copilot. 
Based on your **${panel} kW system** in **${loc.split(',')[0]}**:
- Today's Estimated Output: **${daily.toFixed(1)} kWh** (₹${(daily * rate).toFixed(0)} savings)
- System Efficiency: **${eff.toFixed(1)}%**
- Weather: **${temp.toFixed(1)}°C**, **${cloud.toFixed(0)}% cloud**

Ask me anything about maximizing solar self-consumption, scheduling heavy loads, rooftop geometry, or government subsidies!`;
            suggestions.push('Why is my efficiency low today?', 'When is the best time to charge my EV?', 'Explain PM Surya Ghar subsidy', 'How often should I clean panels?');
        }

        return NextResponse.json({
            reply,
            suggestions,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to process WattBot query' }, { status: 500 });
    }
}
