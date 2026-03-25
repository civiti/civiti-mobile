export type ReportReason =
  | 'Spam'
  | 'Harassment'
  | 'Inappropriate'
  | 'Misinformation'
  | 'Other';

export type CreateReportRequest = {
  reason: ReportReason;
  details?: string | null;
};

export type CreateReportResponse = {
  id: string;
  message: string;
};
