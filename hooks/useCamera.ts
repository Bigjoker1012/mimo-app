import { useState, useRef } from 'react';
import { CameraView, type CameraViewRef } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const cameraRef = useRef<CameraViewRef>(null);

  const requestPermission = async () => {
    const { status } = await CameraView.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
        'Доступ к камере',
        'Для работы приложения нужен доступ к камере. Перейдите в настройки.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Настройки', onPress: () => CameraView.requestCameraPermissionsAsync() },
        ]
      );
    }

    return status === 'granted';
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
    requestPermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
    clearPhoto,
  };
}
