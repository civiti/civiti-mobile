import { useQuery } from '@tanstack/react-query';

import { getGamificationLeaderboard } from '@/services/gamification';
import type { GetLeaderboardParams } from '@/types/gamification';

export function useLeaderboard(params?: GetLeaderboardParams) {
  return useQuery({
    queryKey: ['gamification', 'leaderboard', params?.period, params?.category],
    queryFn: () => getGamificationLeaderboard(params),
    staleTime: 60_000,
  });
}
