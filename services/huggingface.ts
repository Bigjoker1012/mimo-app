const HF_API_URL = 'https://api-inference.huggingface.co/models';
const API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN;

const VITON_MODEL = 'yisol/IDM-VTON';

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function queryModel(
  model: string,
  inputs: Record<string, any>
): Promise<Blob> {
  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace error: ${err}`);
  }

  return response.blob();
}

export async function tryOnWithHuggingFace(
  personImageUrl: string,
  garmentImageUrl: string
): Promise<TryOnResult> {
  try {
    const resultBlob = await queryModel(VITON_MODEL, {
      inputs: {
        person_image: personImageUrl,
        garment_image: garmentImageUrl,
      },
    });

    const imageUrl = URL.createObjectURL(resultBlob);
    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function tryOnWithMultipleModels(
  personImageUrl: string,
  garmentImageUrl: string
): Promise<TryOnResult> {
  const models = [
    'yisol/IDM-VTON',
    'magic-research/magictryon-v1',
  ];

  for (const model of models) {
    try {
      const result = await tryOnWithHuggingFace(personImageUrl, garmentImageUrl);
      if (result.success) return result;
    } catch {
      continue;
    }
  }

  return { success: false, error: 'All models failed' };
}
