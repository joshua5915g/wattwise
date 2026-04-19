import { NextResponse } from 'next/server';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, precision = 1) => Math.round(value * 10 ** precision) / 10;

function getFallbackAdvice(efficiency: number, temp: number, cloud: number, dailyOutput: number) {
  if (efficiency >= 70) {
    return `Excellent solar conditions today. With ${round(efficiency)}% efficiency, run energy-intensive appliances like washing machines, dishwashers, water heaters, and EV chargers during peak sun hours to maximize savings.`;
  }

  if (efficiency >= 40) {
    return `Moderate solar output at ${round(efficiency)}% efficiency. Use major appliances during the best sun window and delay heavy loads until mid-day to get the most from available solar power.`;
  }

  return `Low solar efficiency today. Limit non-essential loads and save battery or grid power for later. If you have storage, preserve it for essential appliances and avoid running heavy loads during cloudy periods.`;
}

function getApplianceRecommendations(efficiency: number) {
  if (efficiency >= 70) {
    return ['Washing machine', 'Dishwasher', 'Water heater', 'EV charger', 'Dryer'];
  }
  if (efficiency >= 40) {
    return ['Washing machine', 'Dishwasher', 'Water heater'];
  }
  return ['Essential appliances only'];
}

function getOptimalHours(efficiency: number) {
  if (efficiency >= 70) {
    return '10:00 AM - 2:00 PM';
  }
  if (efficiency >= 40) {
    return '11:00 AM - 1:00 PM';
  }
  return '12:00 PM - 2:00 PM';
}

export async function POST(request: Request) {
  const body = await request.json();
  const solar_efficiency = Number(body.solar_efficiency ?? 70.0);
  const temperature = Number(body.temperature ?? 28.0);
  const cloud_cover = Number(body.cloud_cover ?? 30.0);
  const daily_output = Number(body.daily_output ?? 25.0);

  const advice = getFallbackAdvice(solar_efficiency, temperature, cloud_cover, daily_output);
  const appliance_recommendations = getApplianceRecommendations(solar_efficiency);
  const optimal_hours = getOptimalHours(solar_efficiency);

  return NextResponse.json({
    advice,
    appliance_recommendations,
    optimal_hours,
  });
}
