import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { getRecentActivities } from '@/services/activity';

const PAGE_SIZE = 10;

export function useRecentActivity() {
  const query = useInfiniteQuery({
    queryKey: ['activity'],
    queryFn: ({ pageParam }) =>
      getRecentActivities({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    maxPages: 3,
    getNextPageParam: (lastPage) => {
      if (!Number.isFinite(lastPage.page) || !Number.isFinite(lastPage.totalPages)) {
        return undefined;
      }
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) =>
      firstPage.page > 1 ? firstPage.page - 1 : undefined,
  });

  const activities = useMemo(
    () => query.data?.pages.flatMap((page) => page.items ?? []) ?? [],
    [query.data],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query.refetch]);

  const fetchNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return {
    activities,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
