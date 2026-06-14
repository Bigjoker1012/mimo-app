const HF_API_URL = 'https://api-inference.huggingface.co/models';
const API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN;

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function imageToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

async function tryModel(model: string, personUri: string, garmentUri: string): Promise<string> {
  const formData = new FormData();
  const personBlob = await imageToBlob(personUri);
  const garmentBlob = await imageToBlob(garmentUri);
  formData.append('person_image', personBlob, 'person.jpg');
  formData.append('garment_image', garmentBlob, 'garment.jpg');

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error || errJson.estimated_time ? `Модель загружается (~${Math.round(errJson.estimated_time)}с)` : errText;
    } catch {}
    throw new Error(errMsg);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    throw new Error('unexpected JSON');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function tryOnWithHuggingFace(
  personImageUri: string,
  garmentImageUri: string
): Promise<TryOnResult> {
  const models = [
    'yisol/IDM-VTON',
    'Kwai-Kolors/Kolors-Virtual-Try-On',
  ];

  for (const model of models) {
    try {
      const imageUrl = await tryModel(model, personImageUri, garmentImageUri);
      return { success: true, imageUrl };
    } catch (error: any) {
      console.log(`Model ${model} failed:`, error.message);
      continue;
    }
  }

  return { success: false, error: 'Все модели временно недоступны. Попробуйте позже.' };
}
