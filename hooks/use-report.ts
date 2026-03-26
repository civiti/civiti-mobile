import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { Localization } from '@/constants/localization';
import { ApiError } from '@/services/errors';
import { reportComment, reportIssue } from '@/services/reports';
import type { CreateReportRequest } from '@/types/reports';

export function showReportError(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 400) {
      Alert.alert(Localization.report.cannotReport);
      return;
    }
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

function logReportError(context: string, err: unknown) {
  console.warn(context, err instanceof ApiError ? `${err.status}: ${err.message}` : err);
}

export function useReportIssue() {
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: CreateReportRequest }) =>
      reportIssue(issueId, data),
    onError: (err) => {
      logReportError('[report] Failed to report issue:', err);
    },
  });
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: CreateReportRequest }) =>
      reportComment(commentId, data),
    onError: (err) => {
      logReportError('[report] Failed to report comment:', err);
    },
  });
}
