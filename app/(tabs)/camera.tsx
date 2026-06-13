import { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '../../components/CameraView';
import { useCamera } from '../../hooks/useCamera';
import { COLORS } from '../../utils/constants';

export default function CameraScreen() {
  const router = useRouter();
  const {
    hasPermission,
    flashMode,
    cameraRef,
    requestPermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
  } = useCamera();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleCapture = async () => {
    const uri = await takePhoto();
    if (uri) {
      router.push({ pathname: '/catalog', params: { photoUri: uri } });
    }
  };

  const handlePickGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) {
      router.push({ pathname: '/catalog', params: { photoUri: uri } });
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  useEffect(() => {
    if (hasPermission === false) {
      Alert.alert(
        'Нет доступа',
        'Разрешите доступ к камере в настройках устройства'
      );
    }
  }, [hasPermission]);

  return (
    <View style={styles.container}>
      <CameraView
        cameraRef={cameraRef}
        flashMode={flashMode}
        onCapture={handleCapture}
        onPickGallery={handlePickGallery}
        onToggleFlash={toggleFlash}
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
