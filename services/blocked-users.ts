import type { BlockedUser, BlockUserResponse } from '@/types/blocked-users';

import { apiClient } from './api-client';

export function blockUser(userId: string): Promise<BlockUserResponse> {
  return apiClient(`/user/blocked/${userId}`, { method: 'POST' });
}

export function unblockUser(userId: string): Promise<void> {
  return apiClient(`/user/blocked/${userId}`, { method: 'DELETE' });
}

export function getBlockedUsers(): Promise<BlockedUser[]> {
  return apiClient('/user/blocked');
}
