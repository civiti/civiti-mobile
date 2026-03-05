import { ErrorBoundary, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { IssueCardSkeleton } from '@/components/issue-card-skeleton';
import { MyIssueCard } from '@/components/my-issue-card';
import { ThemedText } from '@/components/themed-text';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserIssues } from '@/hooks/use-user-issues';
import { NetworkError } from '@/services/errors';
import type { ApiIssueStatus } from '@/types/enums';
import type { IssueListResponse } from '@/types/issues';

export { ErrorBoundary };

// ─── Constants ───────────────────────────────────────────────────

type StatusFilter = 'all' | 'Active' | 'Resolved' | 'Rejected';

const STATUS_SEGMENTS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: Localization.myIssues.filterAll },
  { value: 'Active', label: Localization.myIssues.filterActive },
  { value: 'Resolved', label: Localization.myIssues.filterResolved },
  { value: 'Rejected', label: Localization.myIssues.filterRejected },
];

const keyExtractor = (item: IssueListResponse) => item.id;

// ─── Screen ─────────────────────────────────────────────────────

export default function MyIssuesScreen() {
  const router = useRouter();
  const accent = useThemeColor({}, 'accent');
  const background = useThemeColor({}, 'background');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const queryParams = useMemo(() => {
    const params: { status?: ApiIssueStatus } = {};
    if (statusFilter !== 'all') {
      params.status = statusFilter as ApiIssueStatus;
    }
    return params;
  }, [statusFilter]);

  const {
    issues,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useUserIssues(queryParams);

  const handlePress = useCallback(
    (id: string) => {
      router.push({ pathname: '/issues/[id]', params: { id } });
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/issues/${id}/edit` as any);
    },
    [router],
  );

  const handleCreatePress = useCallback(() => {
    router.push('/create');
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: IssueListResponse }) => (
      <MyIssueCard
        issue={item}
        onPress={() => handlePress(item.id)}
        onEdit={() => handleEdit(item.id)}
      />
    ),
    [handlePress, handleEdit],
  );

  const renderFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <ActivityIndicator style={styles.footer} color={accent} />
      ) : null,
    [isFetchingNextPage, accent],
  );

  // ─── Content branching ──────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="h1" accessibilityRole="header">
          {Localization.myIssues.title}
        </ThemedText>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentedControlWrapper}>
        <SegmentedControl
          segments={STATUS_SEGMENTS}
          selectedValue={statusFilter}
          onValueChange={setStatusFilter}
        />
      </View>

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <IssueCardSkeleton />
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorState
          message={
            error instanceof NetworkError
              ? Localization.errors.noConnection
              : undefined
          }
          onRetry={refetch}
        />
      ) : issues.length === 0 ? (
        <EmptyState
          message={Localization.myIssues.emptyTitle}
          actionLabel={Localization.myIssues.emptyAction}
          onAction={handleCreatePress}
        />
      ) : (
        <FlatList
          data={issues}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={accent} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  segmentedControlWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
  },
});
