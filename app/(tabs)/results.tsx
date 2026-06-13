import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OverlayCanvas } from '../../components/OverlayCanvas';
import { useTryOn } from '../../hooks/useTryOn';
import { getClothingItem, saveTryOnResult } from '../../services/firestore';
import { uploadTryOnResult } from '../../services/storage';
import { initAuth } from '../../services/auth';
import { COLORS, SPACING } from '../../utils/constants';
import { ClothingItem } from '../../types';

export default function ResultsScreen() {
  const { photoUri, clothingId } = useLocalSearchParams<{
    photoUri: string;
    clothingId: string;
  }>();
  const router = useRouter();
  const { loading, error, position, processPhoto, reset } = useTryOn();
  const [clothing, setClothing] = useState<ClothingItem | null>(null);

  useEffect(() => {
    loadClothing();
  }, [clothingId]);

  useEffect(() => {
    if (clothing && photoUri) {
      processPhoto(photoUri, clothing);
    }
  }, [clothing, photoUri]);

  const loadClothing = async () => {
    const item = await getClothingItem(clothingId);
    setClothing(item);
  };

  const handleSave = async () => {
    try {
      const user = await initAuth();
      const resultId = Date.now().toString();
      const resultUrl = await uploadTryOnResult(user.uid, resultId, photoUri);
      await saveTryOnResult(user.uid, clothingId, photoUri, resultUrl);
      Alert.alert('Сохранено', 'Результат сохранён в вашем профиле');
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось сохранить результат');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Посмотри, как мне идёт эта одежда! 👗',
        url: photoUri,
      });
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  const handleBack = () => {
    reset();
    router.back();
  };

  return (
    <View style={styles.container}>
      <OverlayCanvas
        photoUri={photoUri}
        clothingImageUrl={clothing?.imageUrl ?? ''}
        position={position}
        loading={loading}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Поделиться</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
        >
          <Ionicons name="bookmark-outline" size={24} color={COLORS.background} />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: COLORS.background,
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  retryText: {
    color: COLORS.accent,
  },
});
