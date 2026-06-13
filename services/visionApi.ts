import { BodyDetection } from '../types';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

interface VisionResponse {
  responses: Array<{
    faceAnnotations?: Array<{
      boundingPoly: {
        vertices: Array<{ x: number; y: number }>;
      };
      detectionConfidence: number;
    }>;
  }>;
}

export async function detectBody(imageBase64: string): Promise<BodyDetection | null> {
  const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: 'FACE_DETECTION', maxResults: 1 },
          ],
        },
      ],
    }),
  });

  const data: VisionResponse = await response.json();
  const face = data.responses[0]?.faceAnnotations?.[0];

  if (!face) return null;

  const vertices = face.boundingPoly.vertices;
  const x = Math.min(...vertices.map((v) => v.x));
  const y = Math.min(...vertices.map((v) => v.y));
  const maxX = Math.max(...vertices.map((v) => v.x));
  const maxY = Math.max(...vertices.map((v) => v.y));

  return {
    faceBounds: {
      x,
      y,
      width: maxX - x,
      height: maxY - y,
    },
    shoulderWidth: (maxX - x) * 2.5,
    confidence: face.detectionConfidence,
  };
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
