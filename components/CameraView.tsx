import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

import { Text } from 'react-native';

interface CameraViewProps {
  cameraRef: React.RefObject<Camera>;
  flashMode: 'on' | 'off';
  onCapture: () => void;
  onPickGallery: () => void;
  onToggleFlash: () => void;
  onBack: () => void;
}

export function CameraView({
  cameraRef,
  flashMode,
  onCapture,
  onPickGallery,
  onToggleFlash,
  onBack,
}: CameraViewProps) {
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        flashMode={flashMode}
        type={Camera.Constants.Type.back}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>примерка</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={onPickGallery} style={styles.iconButton}>
              <Ionicons name="images-outline" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onCapture} style={styles.captureButton}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onToggleFlash} style={styles.iconButton}>
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-outline'}
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.textPrimary,
  },
});
