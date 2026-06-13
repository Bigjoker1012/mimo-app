import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ClothingCard } from '../../components/ClothingCard';
import { useClothing } from '../../hooks/useClothing';
import { COLORS, SPACING } from '../../utils/constants';
import { ClothingItem } from '../../types';

export default function CatalogScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();
  const { items, loading, error, selectedCategory, selectCategory } = useClothing();

  const handleTryOn = (item: ClothingItem) => {
    router.push({
      pathname: '/results',
      params: { photoUri, clothingId: item.id },
    });
  };

  return (
    <View style={styles.container}>
      <CategoryTabs selected={selectedCategory} onSelect={selectCategory} />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ClothingCard item={item} onTryOn={handleTryOn} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  list: {
    padding: SPACING.sm,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
