import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';
import { tryOnWithOpenAI, imageToBase64 } from '../../services/openai';

export default function ResultsScreen() {
  const { bodyPhoto, clothingPhoto } = useLocalSearchParams<{
    bodyPhoto: string;
    clothingPhoto: string;
  }>();
  const router = useRouter();

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bodyPhoto && clothingPhoto) {
      startTryOn();
    }
  }, []);

  const startTryOn = async () => {
    setLoading(true);
    setError(null);

    try {
      const personBase64 = await imageToBase64(bodyPhoto);
      const garmentBase64 = await imageToBase64(clothingPhoto);

      const result = await tryOnWithOpenAI(personBase64, garmentBase64);

      if (result.success && result.imageUrl) {
        setResultImage(result.imageUrl);
      } else {
        setError(result.error || 'Ошибка примерки');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка примерки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    Alert.alert('Сохранено', 'Результат сохранён');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Посмотри как я примеряю одежду!',
        url: resultImage || bodyPhoto,
      });
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  const handleDelete = () => {
    Alert.alert('Удалить?', 'Результат будет стёрт', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Результат примерки</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>OpenAI обрабатывает фото...</Text>
          <Text style={styles.loadingHint}>GPT-4o анализирует → DALL-E генерирует</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startTryOn}>
            <Text style={styles.retryText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      ) : resultImage ? (
        <View style={styles.resultContainer}>
          <Image source={{ uri: resultImage }} style={styles.resultImage} resizeMode="contain" />
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.photoBox}>
            <Text style={styles.label}>Модель</Text>
            <Image source={{ uri: bodyPhoto }} style={styles.photo} resizeMode="contain" />
          </View>
          <View style={styles.photoBox}>
            <Text style={styles.label}>Одежда</Text>
            <Image source={{ uri: clothingPhoto }} style={styles.photo} resizeMode="contain" />
          </View>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.btnText}>Назад</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.btnText, { color: COLORS.error }]}>Удалить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.btnText}>Поделиться</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.saveBtn]}
          onPress={handleSave}
        >
          <Ionicons name="bookmark" size={20} color={COLORS.background} />
          <Text style={[styles.btnText, { color: COLORS.background }]}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  title: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  loadingHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.accent,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
  },
  photoBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surfaceLight,
  },
  photo: {
    width: '100%',
    height: 250,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
});
