const HF_API_URL = 'https://api-inference.huggingface.co/models';
const CORS_PROXY = 'https://corsproxy.io/?';
const API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN;

const VITON_MODEL = 'yisol/IDM-VTON';

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function imageToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function tryOnWithHuggingFace(
  personImageUri: string,
  garmentImageUri: string
): Promise<TryOnResult> {
  try {
    const personBase64 = await imageToBase64(personImageUri);
    const garmentBase64 = await imageToBase64(garmentImageUri);

    const personBlob = await (await fetch(personImageUri)).blob();
    const garmentBlob = await (await fetch(garmentImageUri)).blob();

    const formData = new FormData();
    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('garment_image', garmentBlob, 'garment.jpg');

    const url = `${CORS_PROXY}${encodeURIComponent(`${HF_API_URL}/${VITON_MODEL}`)}`;

    const response = await fetch(url, {
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

    const resultBlob = await response.blob();
    const imageUrl = URL.createObjectURL(resultBlob);
    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
