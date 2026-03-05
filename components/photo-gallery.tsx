import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';

import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { IssuePhotoResponse } from '@/types/issues';

const GALLERY_HEIGHT = 250;

type ValidPhoto = IssuePhotoResponse & { url: string };

function isValidPhoto(p: IssuePhotoResponse): p is ValidPhoto {
  return p.url != null;
}

type PhotoGalleryProps = {
  photos: IssuePhotoResponse[];
};

function PhotoItem({
  item,
  width,
  onPress,
}: {
  item: ValidPhoto;
  width: number;
  onPress: (id: string) => void;
}) {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={item.description ?? Localization.detail.photoAlt}>
      <Image
        source={{ uri: item.url }}
        style={[styles.photo, { width }]}
        contentFit="cover"
        transition={200}
        recyclingKey={item.id}
        accessibilityRole="image"
        accessibilityLabel={item.description ?? Localization.detail.photoAlt}
      />
    </Pressable>
  );
}

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 } as const;

const keyExtractor = (item: ValidPhoto) => item.id;

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const border = useThemeColor({}, 'border');
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<ValidPhoto>>(null);
  const { width: screenWidth } = useWindowDimensions();

  const validPhotos = photos.filter(isValidPhoto);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ValidPhoto>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const handlePhotoPress = useCallback((id: string) => {
    // TODO(S09): Fullscreen photo viewer
    if (__DEV__) console.log('[S09] Fullscreen photo viewer:', id);
  }, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  );

  if (validPhotos.length === 0) {
    return <View style={[styles.placeholder, { backgroundColor: border }]} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={validPhotos}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <PhotoItem item={item} width={screenWidth} onPress={handlePhotoPress} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />

      {validPhotos.length > 1 && (
        <View style={styles.dotsContainer} pointerEvents="none">
          {validPhotos.map((photo, index) => (
            <View
              key={photo.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.5)',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: GALLERY_HEIGHT,
  },
  photo: {
    height: GALLERY_HEIGHT,
  },
  placeholder: {
    height: GALLERY_HEIGHT,
    width: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.xs,
    borderCurve: 'continuous',
  },
});
