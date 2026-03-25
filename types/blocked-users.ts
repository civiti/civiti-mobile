export type BlockedUser = {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  blockedAt: string;
};

export type BlockUserResponse = {
  blockedUserId: string;
  blockedAt: string;
};
