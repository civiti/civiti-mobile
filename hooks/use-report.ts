import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { Localization } from '@/constants/localization';
import { ApiError } from '@/services/errors';
import { reportComment, reportIssue } from '@/services/reports';
import type { CreateReportRequest } from '@/types/reports';

function showReportError(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      Alert.alert(Localization.report.alreadyReported);
      return;
    }
    if (err.status === 429) {
      Alert.alert(Localization.errors.tooManyRequests);
      return;
    }
  }
  Alert.alert(Localization.errors.generic);
}

export function useReportIssue() {
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: CreateReportRequest }) =>
      reportIssue(issueId, data),
    onError: (err) => {
      console.warn('[report] Failed to report issue:', err);
      showReportError(err);
    },
  });
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: CreateReportRequest }) =>
      reportComment(commentId, data),
    onError: (err) => {
      console.warn('[report] Failed to report comment:', err);
      showReportError(err);
    },
  });
}
