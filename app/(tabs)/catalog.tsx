import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';

export default function CatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>История примерок</Text>

      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>Пока нет сохранённых примерок</Text>
        <Text style={styles.emptyHint}>
          Сделайте примерку и нажмите "Сохранить"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
