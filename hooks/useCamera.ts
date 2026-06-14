import { useState, useRef } from 'react';
import { CameraView, type CameraViewRef, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const cameraRef = useRef<CameraViewRef>(null);

  const hasPermission = permission?.granted ?? null;

  const ensurePermission = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Доступ к камере',
        'Для работы приложения нужен доступ к камере.',
      );
    }
    return result.granted;
  };

  const takePhoto = async (): Promise<string | null> => {
    if (!cameraRef.current) return null;

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setPhoto(result.uri);
      return result.uri;
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото. Попробуйте ещё раз.');
      return null;
    }
  };

  const pickFromGallery = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Доступ к галерее', 'Нужен доступ к галерее для выбора фото.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;

    setPhoto(result.assets[0].uri);
    return result.assets[0].uri;
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const clearPhoto = () => setPhoto(null);

  return {
    hasPermission,
    photo,
    flashMode,
    cameraRef,
    requestPermission: ensurePermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
    clearPhoto,
  };
}
