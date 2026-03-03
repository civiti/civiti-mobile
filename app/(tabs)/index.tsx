import { ErrorBoundary, useRouter } from 'expo-router';
import { useRef, useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityItem } from '@/components/activity-item';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { FilterSheet } from '@/components/filter-sheet';
import { IssueCard } from '@/components/issue-card';
import { IssueCardSkeleton } from '@/components/issue-card-skeleton';
import { IssueMapView } from '@/components/issue-map-view';
import { ThemedText } from '@/components/themed-text';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { BrandColors, Fonts } from '@/constants/theme';
import { useRecentActivity } from '@/hooks/use-activity';
import { useIssues } from '@/hooks/use-issues';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { IssueFilters, IssueListResponse } from '@/types/issues';

export { ErrorBoundary };

// ─── Constants ───────────────────────────────────────────────────

type ViewMode = 'list' | 'map';

const VIEW_SEGMENTS: { value: ViewMode; label: string; icon: 'list.bullet' | 'map.fill' }[] = [
  { value: 'list', label: Localization.viewToggle.list, icon: 'list.bullet' },
  { value: 'map', label: Localization.viewToggle.map, icon: 'map.fill' },
];

// ─── ListHeader ─────────────────────────────────────────────────

type ListHeaderProps = {
  onFilterPress: () => void;
  activeFilterCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

function ListHeader({
  onFilterPress,
  activeFilterCount,
  viewMode,
  onViewModeChange,
}: ListHeaderProps) {
  const iconColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <ThemedText type="h1" accessibilityRole="header">{Localization.tabs.issues}</ThemedText>
      <View style={styles.headerActions}>
        <View style={styles.segmentedControlWrapper}>
          <SegmentedControl
            segments={VIEW_SEGMENTS}
            selectedValue={viewMode}
            onValueChange={onViewModeChange}
          />
        </View>
        <Pressable
          onPress={onFilterPress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0
              ? `${Localization.filter.title}, ${activeFilterCount} ${Localization.filter.activeFilters}`
              : Localization.filter.title
          }
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={26} color={iconColor} />
          {activeFilterCount > 0 && (
            <View
              style={styles.badge}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <ThemedText style={styles.badgeText}>
                {activeFilterCount}
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── ActivityStrip ──────────────────────────────────────────────

type ActivityStripProps = {
  viewMode: ViewMode;
  onIssuePress: (id: string) => void;
};

function ActivityStrip({ viewMode, onIssuePress }: ActivityStripProps) {
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  const {
    activities,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRecentActivity();

  // Hide when empty after loading (error or no data — don't block issues for activity failure)
  if (isError || (!isLoading && activities.length === 0)) return null;

  return (
    <View style={{ display: viewMode === 'map' ? 'none' : 'flex' }}>
      {/* Section title row */}
      <View style={styles.stripHeader}>
        <ThemedText type="h3" accessibilityRole="header">
          {Localization.activity.title}
        </ThemedText>
        {hasNextPage && (
          <Pressable
            onPress={fetchNextPage}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={Localization.activity.seeAll}
          >
            <ThemedText type="caption" style={{ color: accent }}>
              {Localization.activity.seeAll}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Horizontal scroll */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
        >
          <View style={[styles.skeletonCard, { borderColor: border, backgroundColor: surface }]} />
          <View style={[styles.skeletonCard, { borderColor: border, backgroundColor: surface }]} />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
        >
          {activities.map((item) => (
            <ActivityItem key={item.id} activity={item} onPress={onIssuePress} />
          ))}
          {isFetchingNextPage && (
            <ActivityIndicator style={styles.stripLoader} color={accent} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Expose refetch for pull-to-refresh — lifted to screen level
// (ActivityStrip calls useRecentActivity internally, but we also need
//  its refetch in the parent RefreshControl. We solve this by calling
//  useRecentActivity in the parent too — React Query deduplicates.)

// ─── Helpers ────────────────────────────────────────────────────

const keyExtractor = (item: IssueListResponse) => item.id;

// ─── Screen ─────────────────────────────────────────────────────

export default function IssuesScreen() {
  const router = useRouter();
  const accent = useThemeColor({}, 'accent');
  const background = useThemeColor({}, 'background');

  const [filters, setFilters] = useState<IssueFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const filterSheetRef = useRef<BottomSheetMethods>(null);

  const {
    issues,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useIssues(filters);

  // Activity feed — also called inside ActivityStrip, but React Query
  // deduplicates the same queryKey so there's no double fetch.
  const { refetch: activityRefetch } = useRecentActivity();

  const handleRefresh = useCallback(() => {
    void refetch();
    activityRefetch();
  }, [refetch, activityRefetch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.urgency) count++;
    if (filters.status) count++;
    if (filters.sortBy && (filters.sortBy !== 'createdAt' || filters.sortDescending === false)) {
      count++;
    }
    return count;
  }, [filters]);

  const handleFilterPress = useCallback(() => {
    filterSheetRef.current?.expand();
  }, []);

  const handlePress = useCallback(
    (id: string) => {
      router.push({ pathname: '/issues/[id]', params: { id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: IssueListResponse }) => (
      <IssueCard issue={item} onPress={() => handlePress(item.id)} />
    ),
    [handlePress],
  );

  const renderFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <ActivityIndicator style={styles.footer} color={accent} />
      ) : null,
    [isFetchingNextPage, accent],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ─── Content branching ──────────────────────────────────────

  const header = (
    <ListHeader
      onFilterPress={handleFilterPress}
      activeFilterCount={activeFilterCount}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );

  // Loading/error/empty states (shared across both views)
  const showOverlay = isLoading || isError || issues.length === 0;
  const overlay = isLoading ? (
    <>
      <IssueCardSkeleton />
      <IssueCardSkeleton />
      <IssueCardSkeleton />
    </>
  ) : isError ? (
    <ErrorState onRetry={refetch} />
  ) : issues.length === 0 ? (
    <EmptyState message={Localization.states.emptyIssues} />
  ) : null;

  // Data-loaded views — MapView stays mounted to avoid expensive native re-init
  const hasData = !isLoading && !isError && issues.length > 0;

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
        {header}
        <ActivityStrip viewMode={viewMode} onIssuePress={handlePress} />
        {showOverlay && overlay}
        {hasData && (
          <View style={[styles.container, { display: viewMode === 'map' ? 'flex' : 'none' }]}>
            <IssueMapView issues={issues} onIssuePress={handlePress} />
          </View>
        )}
        {hasData && viewMode === 'list' && (
          <FlatList
            data={issues}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={accent} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
      <FilterSheet
        sheetRef={filterSheetRef}
        appliedFilters={filters}
        onApply={setFilters}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  segmentedControlWrapper: {
    width: 150,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: BrandColors.orangeWeb,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    color: BrandColors.oxfordBlue,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Fonts.bold,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
  },
  stripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  stripContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  skeletonCard: {
    width: 260,
    height: 72,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    opacity: 0.4,
  },
  stripLoader: {
    paddingHorizontal: Spacing.lg,
  },
});
