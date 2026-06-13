import { BodyDetection, OverlayConfig, OverlayPosition } from '../types';

export function calculateOverlayPosition(
  body: BodyDetection,
  config: OverlayConfig,
  imageWidth: number,
  imageHeight: number
): OverlayPosition {
  const { faceBounds, shoulderWidth } = body;

  const centerX = faceBounds.x + faceBounds.width / 2;
  const shoulderY = faceBounds.y + faceBounds.height * 1.8;

  const width = shoulderWidth * (config.width / 100);
  const height = width * (config.height / config.width);

  const x = centerX - width / 2 + (config.x / 100) * width;
  const y = shoulderY - height * (config.y / 100);

  return {
    x: Math.max(0, Math.min(x, imageWidth - width)),
    y: Math.max(0, Math.min(y, imageHeight - height)),
    width,
    height,
    rotation: config.rotation,
  };
}

export function isOverlayValid(
  position: OverlayPosition,
  imageWidth: number,
  imageHeight: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= imageWidth &&
    position.y + position.height <= imageHeight &&
    position.width > 0 &&
    position.height > 0
  );
}
