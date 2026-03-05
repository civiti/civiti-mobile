import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

const GRID_COLUMNS = 2;
const HIT_SLOP = 12;

type PhotoGridProps = {
  urls: string[];
  onRemove: (url: string) => void;
};

function PhotoGridItem({
  url,
  size,
  onRemove,
}: {
  url: string;
  size: number;
  onRemove: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.item, { width: size, height: size }]}>
      <Image
        source={{ uri: url }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        recyclingKey={url}
        accessibilityLabel={Localization.detail.photoAlt}
      />
      <Pressable
        onPress={onRemove}
        style={styles.deleteButton}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={Localization.wizard.deletePhoto}
      >
        <IconSymbol
          name="xmark.circle.fill"
          size={24}
          color={Colors[scheme].error}
        />
      </Pressable>
    </View>
  );
}

export function PhotoGrid({ urls, onRemove }: PhotoGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const gridPadding = Spacing.lg * 2;
  const gap = Spacing.sm;
  const itemSize = (windowWidth - gridPadding - gap * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  return (
    <View style={styles.grid}>
      {urls.map((url) => (
        <PhotoGridItem
          key={url}
          url={url}
          size={itemSize}
          onRemove={() => onRemove(url)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  item: {
    borderRadius: BorderRadius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
