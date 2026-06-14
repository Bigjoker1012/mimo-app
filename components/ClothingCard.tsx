import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ClothingItem } from '../types';
import { COLORS, SPACING, SHADOWS } from '../utils/constants';

interface ClothingCardProps {
  item: ClothingItem;
  onTryOn: (item: ClothingItem) => void;
}

export function ClothingCard({ item, onTryOn }: ClothingCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onTryOn(item)}
        >
          <Text style={styles.buttonText}>Примерить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  info: {
    padding: SPACING.sm,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
  },
});
