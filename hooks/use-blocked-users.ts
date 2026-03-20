import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { Localization } from '@/constants/localization';
import { ApiError } from '@/services/errors';
import {
  blockUser,
  getBlockedUsers,
  unblockUser,
} from '@/services/blocked-users';
import { useAuth } from '@/store/auth-context';

const BLOCKED_USERS_KEY = ['user', 'blocked'];

export function useBlockedUsers() {
  const { session } = useAuth();

  const query = useQuery({
    queryKey: BLOCKED_USERS_KEY,
    queryFn: getBlockedUsers,
    enabled: !!session,
  });

  const isBlocked = useCallback(
    (userId: string): boolean => {
      return query.data?.some((u) => u.userId === userId) ?? false;
    },
    [query.data],
  );

  return {
    blockedUsers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isBlocked,
  };
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_KEY });
      Alert.alert(Localization.blockedUsers.blockSuccess);
    },
    onError: (err) => {
      console.warn('[blocked-users] Failed to block user:', err);
      if (err instanceof ApiError && err.status === 409) {
        return; // Already blocked
      }
      Alert.alert(Localization.errors.generic);
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unblockUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_KEY });
      Alert.alert(Localization.blockedUsers.unblockSuccess);
    },
    onError: (err) => {
      console.warn('[blocked-users] Failed to unblock user:', err);
      Alert.alert(Localization.errors.generic);
    },
  });
}
