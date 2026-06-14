const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function tryOnWithHuggingFace(
  personImageUri: string,
  garmentImageUri: string
): Promise<TryOnResult> {
  try {
    const formData = new FormData();

    const personResponse = await fetch(personImageUri);
    const personBlob = await personResponse.blob();
    formData.append('person_image', personBlob, 'person.jpg');

    const garmentResponse = await fetch(garmentImageUri);
    const garmentBlob = await garmentResponse.blob();
    formData.append('garment_image', garmentBlob, 'garment.jpg');

    const response = await fetch(`${API_URL}/api/try-on`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.image) {
      return { success: true, imageUrl: data.image };
    }

    return { success: false, error: data.error || 'Ошибка примерки' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка соединения с сервером' };
  }
}
