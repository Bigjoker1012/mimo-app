const HF_API_URL = 'https://api-inference.huggingface.co/models';
const API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN;

const VITON_MODEL = 'yisol/IDM-VTON';

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function imageToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

async function queryModelWithImages(
  model: string,
  personImageUri: string,
  garmentImageUri: string
): Promise<Blob> {
  const formData = new FormData();

  const personBlob = await imageToBlob(personImageUri);
  const garmentBlob = await imageToBlob(garmentImageUri);

  formData.append('person_image', personBlob, 'person.jpg');
  formData.append('garment_image', garmentBlob, 'garment.jpg');

  const response = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error || errJson.message || errText;
    } catch {}
    throw new Error(`HuggingFace (${response.status}): ${errMsg}`);
  }

  if (contentType.includes('application/json')) {
    const json = await response.json();
    if (json.error) {
      throw new Error(`HuggingFace: ${json.error}`);
    }
    throw new Error('HuggingFace: unexpected JSON response');
  }

  return response.blob();
}

export async function tryOnWithHuggingFace(
  personImageUri: string,
  garmentImageUri: string
): Promise<TryOnResult> {
  try {
    const resultBlob = await queryModelWithImages(VITON_MODEL, personImageUri, garmentImageUri);
    const imageUrl = URL.createObjectURL(resultBlob);
    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
