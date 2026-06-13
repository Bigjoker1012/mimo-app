import { useState } from 'react';
import { detectBody, imageToBase64 } from '../services/visionApi';
import { calculateOverlayPosition, isOverlayValid } from '../utils/overlay';
import { BodyDetection, ClothingItem, OverlayPosition } from '../types';

interface TryOnState {
  loading: boolean;
  error: string | null;
  body: BodyDetection | null;
  position: OverlayPosition | null;
}

export function useTryOn() {
  const [state, setState] = useState<TryOnState>({
    loading: false,
    error: null,
    body: null,
    position: null,
  });

  const processPhoto = async (
    photoUri: string,
    clothing: ClothingItem
  ): Promise<boolean> => {
    setState({ loading: true, error: null, body: null, position: null });

    try {
      const base64 = await imageToBase64(photoUri);
      const body = await detectBody(base64);

      if (!body) {
        setState({
          loading: false,
          error: 'Не удалось обнаружить лицо. Попробуйте другое фото.',
          body: null,
          position: null,
        });
        return false;
      }

      if (body.confidence < 0.5) {
        setState({
          loading: false,
          error: 'Низкое качество распознавания. Попробуйте фото при хорошем освещении.',
          body,
          position: null,
        });
        return false;
      }

      const position = calculateOverlayPosition(
        body,
        clothing.overlayConfig,
        1000,
        1000
      );

      if (!isOverlayValid(position, 1000, 1000)) {
        setState({
          loading: false,
          error: 'Не удалось корректно разместить одежду.',
          body,
          position: null,
        });
        return false;
      }

      setState({ loading: false, error: null, body, position });
      return true;
    } catch (err) {
      setState({
        loading: false,
        error: 'Ошибка обработки фото. Проверьте соединение.',
        body: null,
        position: null,
      });
      return false;
    }
  };

  const reset = () => {
    setState({ loading: false, error: null, body: null, position: null });
  };

  return {
    ...state,
    processPhoto,
    reset,
  };
}
