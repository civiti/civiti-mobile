import type { CreateReportRequest, CreateReportResponse } from '@/types/reports';

import { apiClient } from './api-client';

export function reportIssue(
  issueId: string,
  data: CreateReportRequest,
): Promise<CreateReportResponse> {
  return apiClient(`/issues/${issueId}/report`, {
    method: 'POST',
    body: data,
  });
}

export function reportComment(
  commentId: string,
  data: CreateReportRequest,
): Promise<CreateReportResponse> {
  return apiClient(`/comments/${commentId}/report`, {
    method: 'POST',
    body: data,
  });
}
