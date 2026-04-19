import { NextResponse } from 'next/server';
import { LOCATIONS, DEFAULT_LOCATION } from '@/lib/constants';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const round = (value: number, precision = 1) => Math.round(value * 10 ** precision) / 10;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get('location') || DEFAULT_LOCATION;
  const locationData = LOCATIONS[location] ?? LOCATIONS[DEFAULT_LOCATION];

  const temperature = round(locationData.base_temp + randomBetween(-2, 2));
  const humidity = round(clamp(locationData.base_humidity + randomBetween(-6, 6), 0, 100));
  const uv_index = round(clamp(6 + randomBetween(-1.5, 1.5), 0, 11));
  const wind_speed = round(clamp(10 + randomBetween(-4, 4), 0, 25));
  const solar_index = round(clamp(75 + randomBetween(-15, 15), 0, 100));

  const response = {
    location,
    temperature,
    humidity,
    uv_index,
    wind_speed,
    solar_index,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
