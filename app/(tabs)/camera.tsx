import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const [bodyPhoto, setBodyPhoto] = useState<string | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);

  const pickBodyPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setBodyPhoto(result.assets[0].uri);
    }
  };

  const takeBodyPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ к камере');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setBodyPhoto(result.assets[0].uri);
    }
  };

  const pickClothingPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setClothingPhoto(result.assets[0].uri);
    }
  };

  const takeClothingPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ к камере');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setClothingPhoto(result.assets[0].uri);
    }
  };

  const handleTryOn = () => {
    if (!bodyPhoto) {
      Alert.alert('Выберите фото модели');
      return;
    }
    if (!clothingPhoto) {
      Alert.alert('Выберите фото одежды');
      return;
    }
    router.push({
      pathname: '/(tabs)/results',
      params: { bodyPhoto, clothingPhoto },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Try-On</Text>

      <View style={styles.row}>
        {/* Блок 1: Модель */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Кто примеряет?</Text>
          <View style={styles.photoBox}>
            {bodyPhoto ? (
              <Image source={{ uri: bodyPhoto }} style={styles.photo} />
            ) : (
              <Ionicons name="person-outline" size={36} color={COLORS.textSecondary} />
            )}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={takeBodyPhoto}>
              <Ionicons name="camera" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pickBodyPhoto}>
              <Ionicons name="images" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Галерея</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Блок 2: Одежда */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Что примеряем?</Text>
          <View style={styles.photoBox}>
            {clothingPhoto ? (
              <Image source={{ uri: clothingPhoto }} style={styles.photo} />
            ) : (
              <Ionicons name="shirt-outline" size={36} color={COLORS.textSecondary} />
            )}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={takeClothingPhoto}>
              <Ionicons name="camera" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pickClothingPhoto}>
              <Ionicons name="images" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Галерея</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Кнопка примерки */}
      <TouchableOpacity
        style={[styles.tryOnBtn, (!bodyPhoto || !clothingPhoto) && styles.tryOnBtnDisabled]}
        onPress={handleTryOn}
        disabled={!bodyPhoto || !clothingPhoto}
      >
        <Text style={styles.tryOnText}>Создать образ</Text>
      </TouchableOpacity>
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
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  photoBox: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  tryOnBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  tryOnBtnDisabled: {
    opacity: 0.5,
  },
  tryOnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
