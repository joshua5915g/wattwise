import type {
    PredictionParams,
    PredictionResult,
    AIAdviceParams,
    AIAdviceResult,
    WeatherData,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function getPrediction(params: PredictionParams): Promise<PredictionResult> {
    const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to get prediction');
    }

    return response.json();
}

export async function getAIAdvice(params: AIAdviceParams): Promise<AIAdviceResult> {
    const response = await fetch(`${API_BASE}/api/ai_advice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to get AI advice');
    }

    return response.json();
}

export async function getWeatherData(location: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE}/api/weather?location=${encodeURIComponent(location)}`);

    if (!response.ok) {
        throw new Error('Failed to get weather data');
    }

    return response.json();
}
