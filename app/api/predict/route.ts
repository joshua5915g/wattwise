import { NextResponse } from 'next/server';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, precision = 3) => Math.round(value * 10 ** precision) / 10;
const hours = Array.from({ length: 24 }, (_, index) => index);

function getSolarShape(hour: number) {
  const peakHour = 12;
  const normalized = (hour - peakHour) / 6;
  return clamp(Math.cos(normalized * Math.PI) * 1.2, 0, 1);
}

function computeBaseEfficiency(temperature: number, cloudCover: number, humidity: number) {
  const tempPenalty = Math.max(0, temperature - 26) * 0.45;
  const cloudPenalty = cloudCover * 0.5;
  const humidityPenalty = humidity * 0.12;
  return clamp(100 - tempPenalty - cloudPenalty - humidityPenalty, 15, 95);
}

function seasonalFactor(dayOfYear: number) {
  return 1 + 0.09 * Math.cos(((dayOfYear - 172) / 365) * Math.PI * 2);
}

export async function POST(request: Request) {
  const body = await request.json();
  const temperature = Number(body.temperature ?? 28.0);
  const cloud_cover = Number(body.cloud_cover ?? 30.0);
  const humidity = Number(body.humidity ?? 65.0);
  const panel_capacity = Number(body.panel_capacity ?? 5.0);
  const day_of_year = Number(body.day_of_year ?? 1);

  const baseEfficiency = computeBaseEfficiency(temperature, cloud_cover, humidity);
  const season = seasonalFactor(day_of_year);

  const hourly_output = hours.map((hour) => {
    const shape = getSolarShape(hour);
    const efficiency = (baseEfficiency / 100) * shape * season;
    return round(Math.max(0, panel_capacity * efficiency));
  });

  const total_daily_output = round(hourly_output.reduce((sum, value) => sum + value, 0), 2);
  const peak_output = round(Math.max(...hourly_output), 2);
  const peak_hour = hourly_output.indexOf(Math.max(...hourly_output));
  const max_possible_output = panel_capacity * 8;
  const efficiency_percent = round((total_daily_output / Math.max(1, max_possible_output)) * 100, 2);

  return NextResponse.json({
    hourly_output,
    total_daily_output,
    peak_output,
    peak_hour,
    efficiency_percent,
  });
}
