import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, CATEGORIES } from '../utils/constants';

interface CategoryTabsProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.tab, !selected && styles.tabActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.tabText, !selected && styles.tabTextActive]}>
          Все
        </Text>
      </TouchableOpacity>

      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.tab, selected === cat.id && styles.tabActive]}
          onPress={() => onSelect(cat.id)}
        >
          <Text
            style={[
              styles.tabText,
              selected === cat.id && styles.tabTextActive,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.background,
  },
});
