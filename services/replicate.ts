const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const API_TOKEN = process.env.EXPO_PUBLIC_REPLICATE_API_TOKEN;

interface TryOnResult {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string;
  error?: string;
}

export async function createTryOnPrediction(
  personImageUrl: string,
  garmentImageUrl: string
): Promise<string> {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "wendyong1207/viton:dfad4171be58fc096215ae1d09d2d3c23da5bb55c04da9da04d5980f5d883047",
      input: {
        person_image: personImageUrl,
        garment_image: garmentImageUrl,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${err}`);
  }

  const data = await response.json();
  return data.id;
}

export async function pollPrediction(id: string): Promise<TryOnResult> {
  const response = await fetch(`${REPLICATE_API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to poll prediction');
  }

  const data = await response.json();

  return {
    id: data.id,
    status: data.status,
    output: Array.isArray(data.output) ? data.output[0] : data.output,
    error: data.error,
  };
}

export async function waitForResult(
  id: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollPrediction(id);

    if (result.status === 'succeeded' && result.output) {
      return result.output;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Try-on failed');
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Timeout waiting for result');
}
