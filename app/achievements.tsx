import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AchievementCard } from '@/components/achievement-card';
import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useUserAchievements } from '@/hooks/use-gamification';
import { useThemeColor } from '@/hooks/use-theme-color';

type Segment = 'in-progress' | 'completed';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'in-progress', label: Localization.achievements.inProgress },
  { value: 'completed', label: Localization.achievements.completed },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch, isRefetching } = useUserAchievements();

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const [segment, setSegment] = useState<Segment>('in-progress');

  const { inProgress, completed } = useMemo(() => {
    const all = data ?? [];
    return {
      inProgress: all.filter((a) => !a.completed),
      completed: all.filter((a) => a.completed),
    };
  }, [data]);

  const displayed = segment === 'in-progress' ? inProgress : completed;
  const emptyText =
    segment === 'in-progress'
      ? Localization.achievements.emptyInProgress
      : Localization.achievements.emptyCompleted;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <LoadingSkeleton />
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

  return (
    <ThemedView style={styles.flex}>
      <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={SEGMENTS}
          selectedValue={segment}
          onValueChange={setSegment}
        />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={tintColor} />
        }
      >
        {displayed.length === 0 ? (
          <ThemedText type="caption" style={{ color: textSecondaryColor, textAlign: 'center' }}>
            {emptyText}
          </ThemedText>
        ) : (
          displayed.map((achievement) => (
            <View key={achievement.id} style={styles.cardWrapper}>
              <AchievementCard achievement={achievement} />
              <ThemedText type="caption" style={{ color: tintColor }}>
                {Localization.achievements.rewardPoints(Number.isFinite(achievement.rewardPoints) ? achievement.rewardPoints : 0)}
              </ThemedText>
            </View>
          ))
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
        {Localization.achievements.title}
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
  segmentWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cardWrapper: {
    gap: Spacing.xs,
  },
});
