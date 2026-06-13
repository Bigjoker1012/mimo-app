export interface User {
  uid: string;
  photoURL: string;
  createdAt: Date;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: 'tshirt' | 'shirt' | 'jacket';
  imageUrl: string;
  overlayConfig: OverlayConfig;
  createdAt: Date;
}

export interface OverlayConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TryOnResult {
  id: string;
  userId: string;
  clothingId: string;
  originalPhotoUrl: string;
  resultPhotoUrl: string;
  createdAt: Date;
}

export interface BodyDetection {
  faceBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  shoulderWidth: number;
  confidence: number;
}

export interface OverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
