import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';

export default function ResultsScreen() {
  const { bodyPhoto, clothingPhoto } = useLocalSearchParams<{
    bodyPhoto: string;
    clothingPhoto: string;
  }>();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    Alert.alert('Сохранено', 'Результат сохранён в историю');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Посмотри как я примеряю одежду!',
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

      <View style={styles.photosContainer}>
        <View style={styles.photoBox}>
          <Text style={styles.label}>Модель</Text>
          <Image source={{ uri: bodyPhoto }} style={styles.photo} resizeMode="contain" />
        </View>
        <View style={styles.photoBox}>
          <Text style={styles.label}>Одежда</Text>
          <Image source={{ uri: clothingPhoto }} style={styles.photo} resizeMode="contain" />
        </View>
      </View>

      <Text style={styles.hint}>
        Для полноценной примерки необходим Google Cloud Vision API.{'\n'}
        Сейчас показаны исходные фото.
      </Text>

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
          disabled={saved}
        >
          <Ionicons name="bookmark" size={20} color={COLORS.background} />
          <Text style={[styles.btnText, { color: COLORS.background }]}>
            {saved ? 'Сохранено' : 'Сохранить'}
          </Text>
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
  photosContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
    height: 200,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
