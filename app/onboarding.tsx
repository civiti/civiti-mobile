import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { Localization } from '@/constants/localization';
import { BrandColors, Fonts } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { ONBOARDING_KEY } from '@/constants/storage-keys';

// ─── Slide data ────────────────────────────────────────────────

type Slide = {
  id: string;
  icon: 'magnifyingglass' | 'envelope.fill' | 'person.2.fill';
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'magnifyingglass',
    title: Localization.onboarding.slide1Title,
    subtitle: Localization.onboarding.slide1Subtitle,
  },
  {
    id: '2',
    icon: 'envelope.fill',
    title: Localization.onboarding.slide2Title,
    subtitle: Localization.onboarding.slide2Subtitle,
  },
  {
    id: '3',
    icon: 'person.2.fill',
    title: Localization.onboarding.slide3Title,
    subtitle: Localization.onboarding.slide3Subtitle,
  },
];

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 } as const;

const keyExtractor = (item: Slide) => item.id;

// ─── Slide item ────────────────────────────────────────────────

type SlideItemProps = {
  item: Slide;
  width: number;
};

const SlideItem = React.memo(function SlideItem({ item, width }: SlideItemProps) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconCircle}>
        <IconSymbol name={item.icon} size={80} color={BrandColors.orangeWeb} />
      </View>
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        {item.title}
      </Text>
      <Text style={styles.subtitle} accessibilityRole="text">{item.subtitle}</Text>
    </View>
  );
});

// ─── Screen ────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  // Prevent Android back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  // Re-anchor scroll position on rotation
  useEffect(() => {
    flatListRef.current?.scrollToIndex({ index: activeIndex, animated: false });
  }, [width, activeIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Slide>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const handleComplete = useCallback(() => {
    if (isPending) return;
    setIsPending(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch((err) =>
      console.warn('[onboarding] Failed to save flag:', err),
    );
    router.replace('/');
  }, [isPending]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Skip button */}
      <Pressable
        onPress={handleComplete}
        style={[styles.skipButton, { top: insets.top + Spacing.sm }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={Localization.onboarding.skip}
      >
        <Text style={styles.skipText}>{Localization.onboarding.skip}</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <SlideItem item={item} width={width} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />

      {/* Bottom section: dots + button */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.xl }]}>
        {/* Page dots */}
        <View
          style={styles.dotsContainer}
          accessibilityLabel={`Pagina ${activeIndex + 1} din ${SLIDES.length}`}
        >
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex
                      ? BrandColors.orangeWeb
                      : 'rgba(255,255,255,0.3)',
                },
              ]}
            />
          ))}
        </View>

        {/* Start button on last slide */}
        {isLastSlide && (
          <Button
            variant="primary"
            title={Localization.onboarding.start}
            onPress={handleComplete}
            style={styles.startButton}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const ICON_CIRCLE_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.oxfordBlue,
  },
  skipButton: {
    position: 'absolute',
    right: Spacing.lg,
    zIndex: 1,
    padding: Spacing.sm,
  },
  skipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.7)',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    borderCurve: 'continuous',
    backgroundColor: BrandColors.orangeWeb20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  startButton: {
    width: '100%',
  },
});
