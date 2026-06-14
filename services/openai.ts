const OPENAI_API_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface TryOnResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function analyzeImages(
  personImageBase64: string,
  garmentImageBase64: string
): Promise<string> {
  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe these two images in detail for virtual try-on. First image is a person, second is a garment. Describe the person pose, body type, and the garment style, color, type.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${personImageBase64}` },
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${garmentImageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateTryOnImage(
  description: string
): Promise<string> {
  const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `A realistic photo of a person wearing the following clothing: ${description}. The person is standing in a natural pose, full body shot, studio lighting, high quality fashion photography.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DALL-E API error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

export async function tryOnWithOpenAI(
  personImageBase64: string,
  garmentImageBase64: string
): Promise<TryOnResult> {
  try {
    const description = await analyzeImages(personImageBase64, garmentImageBase64);
    const imageUrl = await generateTryOnImage(description);
    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function imageToBase64(uri: string): Promise<string> {
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
