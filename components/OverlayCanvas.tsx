import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { OverlayPosition } from '../types';
import { COLORS } from '../utils/constants';

interface OverlayCanvasProps {
  photoUri: string;
  clothingImageUrl: string;
  position: OverlayPosition | null;
  loading?: boolean;
}

export function OverlayCanvas({
  photoUri,
  clothingImageUrl,
  position,
  loading = false,
}: OverlayCanvasProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />

      {position && (
        <Image
          source={{ uri: clothingImageUrl }}
          style={[
            styles.clothing,
            {
              left: `${position.x / 10}%`,
              top: `${position.y / 10}%`,
              width: `${position.width / 10}%`,
              height: `${position.height / 10}%`,
              transform: [{ rotate: `${position.rotation}deg` }],
            },
          ]}
          resizeMode="contain"
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  clothing: {
    position: 'absolute',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
