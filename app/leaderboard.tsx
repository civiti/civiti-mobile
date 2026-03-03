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

import { ErrorState } from '@/components/error-state';
import { LeaderboardEntry } from '@/components/leaderboard-entry';
import { LeaderboardPodium } from '@/components/leaderboard-podium';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChipSelector } from '@/components/ui/chip-selector';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/store/auth-context';

type Period = 'all-time' | 'monthly' | 'weekly';

const PERIOD_SEGMENTS: { value: Period; label: string }[] = [
  { value: 'all-time', label: Localization.leaderboard.periodAllTime },
  { value: 'monthly', label: Localization.leaderboard.periodMonthly },
  { value: 'weekly', label: Localization.leaderboard.periodWeekly },
];

const CATEGORY_OPTIONS = [
  { value: 'points', label: Localization.leaderboard.categoryPoints },
  { value: 'issues', label: Localization.leaderboard.categoryIssues },
  { value: 'resolved', label: Localization.leaderboard.categoryResolved },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const [period, setPeriod] = useState<Period>('all-time');
  const [category, setCategory] = useState('points');

  const { data, isLoading, isError, refetch, isRefetching } = useLeaderboard({
    period,
    category,
  });

  const handleCategoryChange = useCallback((vals: string[]) => {
    setCategory(vals[vals.length - 1] ?? 'points');
  }, []);

  const { topThree, remaining } = useMemo(() => {
    const all = data?.leaderboard ?? [];
    return {
      topThree: all.slice(0, 3),
      remaining: all.slice(3),
    };
  }, [data?.leaderboard]);

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

      {/* Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.segmentWrapper}>
          <SegmentedControl
            segments={PERIOD_SEGMENTS}
            selectedValue={period}
            onValueChange={setPeriod}
          />
        </View>
        <ChipSelector
          options={CATEGORY_OPTIONS}
          selectedValues={[category]}
          onSelectionChange={handleCategoryChange}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={tintColor} />
        }
      >
        {topThree.length === 0 && remaining.length === 0 ? (
          <ThemedText type="caption" style={{ color: textSecondaryColor, textAlign: 'center' }}>
            {Localization.leaderboard.empty}
          </ThemedText>
        ) : (
          <>
            <LeaderboardPodium entries={topThree} />
            {remaining.map((entry) => (
              <LeaderboardEntry key={entry.user.id} entry={entry} isCurrentUser={entry.user.id === user?.id} />
            ))}
          </>
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
        {Localization.leaderboard.title}
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
  filtersSection: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  segmentWrapper: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
});
