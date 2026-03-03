import { useCallback, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeCard } from '@/components/badge-card';
import { ErrorState } from '@/components/error-state';
import { SkeletonBlock } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useUserBadges } from '@/hooks/use-gamification';
import { useThemeColor } from '@/hooks/use-theme-color';

const BADGE_CARD_WIDTH = 80;
const GRID_GAP = Spacing.md;

export default function BadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch, isRefetching } = useUserBadges();

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const { earned, locked } = useMemo(() => {
    const badges = data ?? [];
    return {
      earned: badges.filter((b) => b.isEarned),
      locked: badges.filter((b) => !b.isEarned),
    };
  }, [data]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} width={BADGE_CARD_WIDTH} height={BADGE_CARD_WIDTH} />
          ))}
        </View>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <ErrorState onRetry={() => { void refetch(); }} />
      </ThemedView>
    );
  }

  const hasBoth = earned.length > 0 && locked.length > 0;

  return (
    <ThemedView style={styles.flex}>
      <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={tintColor} />
        }
      >
        {earned.length === 0 && locked.length === 0 && (
          <ThemedText type="caption" style={{ color: textSecondaryColor, textAlign: 'center' }}>
            {Localization.badges.empty}
          </ThemedText>
        )}

        {earned.length > 0 && (
          <View style={styles.section}>
            {hasBoth && (
              <ThemedText type="h3">{Localization.badges.earnedSection}</ThemedText>
            )}
            <View style={[styles.grid, { gap: GRID_GAP }]}>
              {earned.map((badge) => (
                <View key={badge.id} style={styles.badgeWrapper}>
                  <BadgeCard badge={badge} />
                </View>
              ))}
            </View>
          </View>
        )}

        {locked.length > 0 && (
          <View style={styles.section}>
            {hasBoth && (
              <ThemedText type="h3">{Localization.badges.lockedSection}</ThemedText>
            )}
            <View style={[styles.grid, { gap: GRID_GAP }]}>
              {locked.map((badge) => (
                <View key={badge.id} style={styles.badgeWrapper}>
                  <BadgeCard badge={badge} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// ─── Screen Header ─────────────────────────────────────────────

function ScreenHeader({
  onBack,
  textColor,
  topInset,
}: {
  onBack: () => void;
  textColor: string;
  topInset: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + Spacing.sm }]}>
      <Pressable
        onPress={onBack}
        style={styles.headerButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={Localization.actions.back}
      >
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </Pressable>
      <ThemedText type="h2" accessibilityRole="header">
        {Localization.badges.title}
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
  },
  section: {
    gap: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeWrapper: {
    width: BADGE_CARD_WIDTH,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
});
