import type { PaginationParams, SortParams } from './api';

export type CommentUserResponse = {
  id: string;
  displayName: string | null;
  photoUrl: string | null;
  level: number;
}

export type CommentResponse = {
  id: string;
  issueId: string;
  content: string | null;
  helpfulCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  parentCommentId: string | null;
  replyCount: number;
  user: CommentUserResponse;
  hasVoted: boolean;
}

export type CreateCommentRequest = {
  content: string;
  parentCommentId?: string | null;
}

export type UpdateCommentRequest = {
  content: string;
}

export type CommentVoteResponse = {
  message: string | null;
}

export type GetCommentsParams = PaginationParams & SortParams;
