import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthorityCard } from '@/components/authority-card';
import { CommentInputBar } from '@/components/comment-input-bar';
import { CommentItem } from '@/components/comment-item';
import { EmailPrompt } from '@/components/email-prompt';
import { ErrorState } from '@/components/error-state';
import { LocationPreview } from '@/components/location-preview';
import { PhotoGallery } from '@/components/photo-gallery';
import { ReportSheet, type ReportSheetRef, type ReportTarget } from '@/components/report-sheet';
import { ThemedText } from '@/components/themed-text';
import { VoteButton } from '@/components/vote-button';
import { Button } from '@/components/ui/button';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { CategoryBadge } from '@/components/ui/category-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusBadge } from '@/components/ui/status-badge';
import { UrgencyBadge } from '@/components/ui/urgency-badge';
import { IssueStatus } from '@/constants/enums';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useBlockedUsers, useBlockUser } from '@/hooks/use-blocked-users';
import { useComments, useUpdateComment } from '@/hooks/use-comments';
import { useEmailTracking } from '@/hooks/use-email-tracking';
import { useIssueDetail } from '@/hooks/use-issue-detail';
import { useProfile } from '@/hooks/use-profile';
import { useReportComment, useReportIssue } from '@/hooks/use-report';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/store/auth-context';
import type { CommentResponse } from '@/types/comments';
import type { ReportReason } from '@/types/reports';
import type { IssueAuthorityResponse, IssueDetailResponse } from '@/types/issues';
import { buildMailto } from '@/utils/build-mailto';
import { formatTimeAgo } from '@/utils/format-time-ago';

const NOOP = () => {};

function isValidIssueStatus(s: string): s is (typeof IssueStatus)[keyof typeof IssueStatus] {
  return (Object.values(IssueStatus) as string[]).includes(s);
}

type SortMode = 'newest' | 'mostHelpful';

// ─── Sub-components ─────────────────────────────────────────────

function DetailHeader({
  onBack,
  onShare,
  onReport,
}: {
  onBack: () => void;
  onShare: () => void;
  onReport: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <Pressable
        onPress={onBack}
        style={styles.headerButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={Localization.actions.back}
      >
        <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
      </Pressable>
      <View style={styles.headerRight}>
        <Pressable
          onPress={onReport}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={Localization.report.title}
        >
          <IconSymbol name="flag.fill" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={onShare}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={Localization.detail.share}
        >
          <IconSymbol name="square.and.arrow.up" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function TitleSection({ issue }: { issue: IssueDetailResponse }) {
  const textSecondary = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.section}>
      <ThemedText type="h1">{issue.title ?? '—'}</ThemedText>

      <View style={styles.badgeRow}>
        {isValidIssueStatus(issue.status) ? (
          <StatusBadge status={issue.status} />
        ) : null}
        <CategoryBadge category={issue.category} />
        <UrgencyBadge level={issue.urgency} />
      </View>

      <View style={styles.metaRow}>
        <IconSymbol name="clock.fill" size={14} color={textSecondary} />
        <ThemedText type="caption" style={{ color: textSecondary }}>
          {formatTimeAgo(issue.createdAt)}
        </ThemedText>
        <ThemedText type="caption" style={{ color: textSecondary }}>
          · {Localization.detail.submittedBy}{' '}
          {issue.user.name ?? '?'}
        </ThemedText>
      </View>
    </View>
  );
}

function StatisticsRow({ issue }: { issue: IssueDetailResponse }) {
  const border = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');

  const stats = [
    { label: Localization.detail.emailsSent, value: Number.isFinite(issue.emailsSent) ? issue.emailsSent : '—', color: accent },
    { label: Localization.detail.votes, value: Number.isFinite(issue.communityVotes) ? issue.communityVotes : '—', color: accent },
    {
      label: Localization.detail.authoritiesCount,
      value: issue.authorities?.length ?? 0,
      color: accent,
    },
  ];

  return (
    <View style={[styles.statsRow, { borderColor: border }]}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.statItem,
            index < stats.length - 1 && { borderRightWidth: 1, borderRightColor: border },
          ]}
        >
          <ThemedText type="h2" style={{ color: stat.color, fontVariant: ['tabular-nums'] }}>
            {stat.value}
          </ThemedText>
          <ThemedText type="caption" style={{ color: textSecondary }}>
            {stat.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="h2" accessibilityRole="header">{title}</ThemedText>
      {children}
    </View>
  );
}

function AuthoritiesSection({
  authorities,
  onSendEmail,
}: {
  authorities: IssueAuthorityResponse[];
  onSendEmail: (authority: IssueAuthorityResponse) => void;
}) {
  return (
    <SectionBlock title={Localization.detail.authorities}>
      <View style={styles.authorityList}>
        {authorities.map((auth, index) => (
          <AuthorityCard
            key={auth.authorityId ?? `custom-${index}`}
            authority={auth}
            onSendEmail={onSendEmail}
          />
        ))}
      </View>
    </SectionBlock>
  );
}

function CommentsSection({
  issueId,
  currentUserId,
  onReply,
  editingCommentId,
  editText,
  onEditTextChange,
  onEditSave,
  onEditCancel,
  onStartEdit,
  expandedThreads,
  onToggleThread,
  onSortChange,
  onReport,
  onBlockUser,
  isBlockedUser,
}: {
  issueId: string;
  currentUserId: string | undefined;
  onReply: (comment: CommentResponse) => void;
  editingCommentId: string | null;
  editText: string;
  onEditTextChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onStartEdit: (comment: CommentResponse) => void;
  expandedThreads: Set<string>;
  onToggleThread: (commentId: string) => void;
  onSortChange: () => void;
  onReport: (comment: CommentResponse) => void;
  onBlockUser: (comment: CommentResponse) => void;
  isBlockedUser: (userId: string) => boolean;
}) {
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');

  const sortParams = sortMode === 'newest'
    ? { sortBy: 'createdAt' as const, sortDescending: true }
    : { sortBy: 'helpfulCount' as const, sortDescending: true };

  const {
    comments, hasNextPage, fetchNextPage,
    isFetchingNextPage, isLoading, isError, error: commentsError, refetch,
  } = useComments(issueId, sortParams);

  const toggleSort = useCallback(() => {
    setRevealedIds(new Set());
    setSortMode((prev) => (prev === 'newest' ? 'mostHelpful' : 'newest'));
    onSortChange();
  }, [onSortChange]);

  const handleReveal = useCallback((id: string) => {
    setRevealedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const threaded = useMemo(() => {
    const visible = comments.filter((c) => !isBlockedUser(c.user.id));
    const commentIds = new Set(visible.map((c) => c.id));
    const items = visible.filter(
      (c) => !c.parentCommentId || !commentIds.has(c.parentCommentId),
    );
    const itemIds = new Set(items.map((c) => c.id));
    // Build parent lookup so we can walk grandchildren up to their thread root
    const parentMap = new Map<string, string>();
    for (const c of comments) {
      if (c.parentCommentId) parentMap.set(c.id, c.parentCommentId);
    }
    const repliesByParent = new Map<string, CommentResponse[]>();
    for (const c of visible) {
      if (!c.parentCommentId) continue;
      if (itemIds.has(c.id)) continue; // already promoted to top-level — don't also nest it
      // Walk up to find the nearest ancestor that is a top-level item
      let rootId = c.parentCommentId;
      const visited = new Set<string>();
      while (!itemIds.has(rootId) && parentMap.has(rootId)) {
        if (visited.has(rootId)) break;
        visited.add(rootId);
        rootId = parentMap.get(rootId)!;
      }
      if (!itemIds.has(rootId)) continue;
      const list = repliesByParent.get(rootId) ?? [];
      list.push(c);
      repliesByParent.set(rootId, list);
    }
    const commentById = new Map(visible.map((c) => [c.id, c]));
    return { items, repliesByParent, commentById, visibleCount: visible.length };
  }, [comments, isBlockedUser]);

  return (
    <SectionBlock title={`${Localization.comments.title} (${threaded.visibleCount})`}>
      {threaded.visibleCount > 0 ? (
        <Pressable onPress={toggleSort} style={styles.sortToggle} hitSlop={8} accessibilityRole="button">
          <ThemedText type="caption" style={{ color: accent }}>
            {sortMode === 'newest'
              ? Localization.comments.sortNewest
              : Localization.comments.sortMostHelpful}
          </ThemedText>
        </Pressable>
      ) : null}

      {isLoading ? (
        <ActivityIndicator style={styles.commentLoader} />
      ) : isError ? (
        <ErrorState message={commentsError?.message} onRetry={refetch} />
      ) : comments.length === 0 ? (
        <ThemedText type="caption" style={{ color: textSecondary }}>
          {Localization.states.emptyComments}
        </ThemedText>
      ) : (
        <>
          {threaded.items.map((comment) => {
            const replies = threaded.repliesByParent.get(comment.id) ?? [];
            const isExpanded = expandedThreads.has(comment.id);
            return (
              <View key={comment.id} style={commentThreadStyles.thread}>
                <CommentItem
                  comment={comment}
                  issueId={issueId}
                  currentUserId={currentUserId}
                  parentAuthorName={null}
                  onReply={onReply}
                  onStartEdit={onStartEdit}
                  isEditing={editingCommentId === comment.id}
                  editText={editingCommentId === comment.id ? editText : ''}
                  onEditTextChange={onEditTextChange}
                  onEditSave={onEditSave}
                  onEditCancel={onEditCancel}
                  repliesExpanded={isExpanded}
                  replyCountOverride={comment.replyCount}
                  onToggleReplies={
                    replies.length > 0 || comment.replyCount > 0
                      ? onToggleThread
                      : undefined
                  }
                  onReport={onReport}
                  onBlockUser={onBlockUser}
                  isRevealed={revealedIds.has(comment.id)}
                  onReveal={handleReveal}
                />
                {isExpanded
                  ? replies.length > 0
                    ? replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          issueId={issueId}
                          currentUserId={currentUserId}
                          parentAuthorName={
                            threaded.commentById.get(reply.parentCommentId!)?.user.displayName ?? null
                          }
                          onReply={onReply}
                          onStartEdit={onStartEdit}
                          isEditing={editingCommentId === reply.id}
                          editText={editingCommentId === reply.id ? editText : ''}
                          onEditTextChange={onEditTextChange}
                          onEditSave={onEditSave}
                          onEditCancel={onEditCancel}
                          isReply
                          onReport={onReport}
                          onBlockUser={onBlockUser}
                          isRevealed={revealedIds.has(reply.id)}
                          onReveal={handleReveal}
                        />
                      ))
                    : (
                        <ThemedText
                          type="caption"
                          style={{ color: textSecondary, marginLeft: Spacing['2xl'] }}
                        >
                          {hasNextPage
                            ? Localization.comments.repliesMayLoadWithMore
                            : Localization.comments.repliesUnavailable}
                        </ThemedText>
                      )
                  : null}
              </View>
            );
          })}
          {hasNextPage ? (
            <Pressable
              onPress={handleLoadMore}
              disabled={isFetchingNextPage}
              style={styles.loadMore}
              hitSlop={8}
              accessibilityRole="button"
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" />
              ) : (
                <ThemedText type="link" style={{ color: accent }}>
                  {Localization.comments.loadMore}
                </ThemedText>
              )}
            </Pressable>
          ) : null}
        </>
      )}
    </SectionBlock>
  );
}

function StickyBottomBar({
  issueId,
  hasVoted,
  voteCount,
  onEmailCta,
  emailDisabled,
  replyingTo,
  onClearReply,
  onReplySuccess,
}: {
  issueId: string;
  hasVoted: boolean;
  voteCount: number;
  onEmailCta: () => void;
  emailDisabled: boolean;
  replyingTo: CommentResponse | null;
  onClearReply: () => void;
  onReplySuccess: (parentCommentId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: surface,
          borderTopColor: border,
          paddingBottom: insets.bottom || Spacing.md,
        },
      ]}
    >
      {/* Top row: vote + email CTA */}
      <View style={styles.bottomBarTopRow}>
        <VoteButton issueId={issueId} hasVoted={hasVoted} voteCount={voteCount} />
        <Button
          title={Localization.detail.sendEmail}
          variant="primary"
          onPress={onEmailCta}
          disabled={emailDisabled}
          style={styles.ctaButton}
        />
      </View>

      {/* Bottom row: comment input */}
      <CommentInputBar
        issueId={issueId}
        replyingTo={replyingTo}
        onClearReply={onClearReply}
        onReplySuccess={onReplySuccess}
      />
    </View>
  );
}

function DetailSkeleton() {
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');

  return (
    <View style={styles.skeleton}>
      <View style={[styles.skeletonPhoto, { backgroundColor: border }]} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: '80%', backgroundColor: border }]} />
        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: border }]} />
        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: border }]} />
        <View style={[styles.skeletonBlock, { backgroundColor: surface, borderColor: border }]} />
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const scrollViewRef = useRef<ScrollView>(null);
  const authoritiesYRef = useRef(0);

  const { requireAuth, user } = useAuth();
  const { data: issue, isLoading, isError, error, refetch } = useIssueDetail(id);
  const { data: profile } = useProfile();
  const { mutate: trackEmailSent } = useEmailTracking(id);
  const { mutate: updateCommentFn, isPending: isEditSaving } = useUpdateComment(id);
  const { mutate: reportIssueFn, isPending: isReportingIssue } = useReportIssue();
  const { mutate: reportCommentFn, isPending: isReportingComment } = useReportComment();
  const { mutate: blockUserFn } = useBlockUser();
  const { isBlocked } = useBlockedUsers();
  const reportSheetRef = useRef<ReportSheetRef>(null);
  const [reportTargetType, setReportTargetType] = useState<'issue' | 'comment' | null>(null);
  const reportTargetTypeRef = useRef<'issue' | 'comment' | null>(null);

  // Reply/edit state
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const toggleThread = useCallback((commentId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const handleSortChange = useCallback(() => {
    setExpandedThreads(new Set());
    setEditingCommentId(null);
    setEditText('');
    setReplyingTo(null);
  }, []);

  const handleReplySuccess = useCallback((parentCommentId: string) => {
    setExpandedThreads((prev) => {
      if (prev.has(parentCommentId)) return prev;
      const next = new Set(prev);
      next.add(parentCommentId);
      return next;
    });
  }, []);

  const handleReply = useCallback((comment: CommentResponse) => {
    setEditingCommentId(null);
    setEditText('');
    setReplyingTo(comment);
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleStartEdit = useCallback((comment: CommentResponse) => {
    setReplyingTo(null);
    setEditingCommentId(comment.id);
    setEditText(comment.content ?? '');
  }, []);

  const handleEditTextChange = useCallback((text: string) => {
    setEditText(text);
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editingCommentId || !editText.trim() || isEditSaving) return;
    updateCommentFn(
      { commentId: editingCommentId, data: { content: editText.trim() } },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditText('');
        },
        onError: (err) => {
          console.warn('[comments] Failed to update comment', editingCommentId, err);
          Alert.alert(Localization.errors.generic);
        },
      },
    );
  }, [editingCommentId, editText, isEditSaving, updateCommentFn]);

  const handleEditCancel = useCallback(() => {
    setEditingCommentId(null);
    setEditText('');
  }, []);

  // Report + block handlers
  const handleReportIssue = useCallback(() => {
    requireAuth(() => {
      setReportTargetType('issue');
      reportTargetTypeRef.current = 'issue';
      reportSheetRef.current?.open({ type: 'issue', id });
    });
  }, [requireAuth, id]);

  const handleReportComment = useCallback((comment: CommentResponse) => {
    requireAuth(() => {
      setReportTargetType('comment');
      reportTargetTypeRef.current = 'comment';
      reportSheetRef.current?.open({ type: 'comment', id: comment.id });
    });
  }, [requireAuth]);

  const handleReportSubmit = useCallback(
    (target: ReportTarget, reason: ReportReason, details: string | null) => {
      const data = { reason, details };
      const submittedType = target.type;
      const onSuccess = () => {
        if (reportTargetTypeRef.current === submittedType) {
          reportSheetRef.current?.close();
          reportTargetTypeRef.current = null;
          setReportTargetType(null);
        }
        Alert.alert(Localization.report.success);
      };
      if (target.type === 'issue') {
        reportIssueFn({ issueId: target.id, data }, { onSuccess });
      } else {
        reportCommentFn({ commentId: target.id, data }, { onSuccess });
      }
    },
    [reportIssueFn, reportCommentFn],
  );

  const handleBlockUser = useCallback(
    (comment: CommentResponse) => {
      const name = comment.user.displayName ?? '?';
      Alert.alert(
        Localization.blockedUsers.blockConfirmTitle,
        Localization.blockedUsers.blockConfirmMessage(name),
        [
          { text: Localization.actions.cancel, style: 'cancel' },
          {
            text: Localization.blockedUsers.blockConfirmYes,
            style: 'destructive',
            onPress: () => blockUserFn(comment.user.id),
          },
        ],
      );
    },
    [blockUserFn],
  );

  // Email flow state
  const emailPromptRef = useRef<BottomSheetMethods>(null);
  const emailFlowActiveRef = useRef(false);

  // Detect return from email client via AppState
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && emailFlowActiveRef.current) {
        emailFlowActiveRef.current = false;
        timeoutId = setTimeout(() => {
          emailPromptRef.current?.snapToIndex(0);
        }, 300);
      }
    });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.remove();
    };
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(async () => {
    if (!issue) return;
    try {
      await Share.share({
        title: issue.title ?? 'Issue',
        message: `${issue.title ?? 'Issue'}\n${issue.description ?? ''}`,
        ...(Platform.OS === 'ios' ? { url: `civiti://issues/${issue.id}` } : {}),
      });
    } catch (err) {
      console.warn('[share] Share failed for issue', issue.id, err);
    }
  }, [issue]);

  const handleScrollToAuthorities = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: authoritiesYRef.current,
      animated: true,
    });
  }, []);

  const handleAuthoritiesLayout = useCallback(
    (event: { nativeEvent: { layout: { y: number } } }) => {
      authoritiesYRef.current = event.nativeEvent.layout.y;
    },
    [],
  );

  // Email flow: triggered from authority card or bottom bar CTA
  const handleSendEmail = useCallback(
    (authority: IssueAuthorityResponse) => {
      if (!issue || !authority.email) return;
      requireAuth(() => {
        const mailto = buildMailto({
          authority,
          issue,
          userName: profile?.displayName ?? null,
        });
        Linking.openURL(mailto)
          .then(() => {
            emailFlowActiveRef.current = true;
          })
          .catch((err) => {
            console.warn('[email] Failed to open mailto link for issue', issue.id, err);
            Alert.alert(Localization.email.openFailed);
          });
      });
    },
    [issue, requireAuth, profile?.displayName],
  );

  // Bottom bar CTA: single authority → send directly, multiple → scroll to section
  const handleEmailCta = useCallback(() => {
    if (!issue) return;
    const authorities = issue.authorities ?? [];
    const withEmail = authorities.filter((a) => a.email);
    if (withEmail.length === 0) return;
    if (withEmail.length === 1) {
      handleSendEmail(withEmail[0]);
    } else {
      handleScrollToAuthorities();
    }
  }, [issue, handleSendEmail, handleScrollToAuthorities]);

  const handleEmailConfirm = useCallback(() => {
    emailPromptRef.current?.close();
    trackEmailSent();
  }, [trackEmailSent]);

  const handleEmailDismiss = useCallback(() => {
    emailPromptRef.current?.close();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <DetailHeader onBack={handleBack} onShare={NOOP} onReport={NOOP} />
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !issue) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={{ paddingTop: insets.top + Spacing.sm }}>
          <Pressable onPress={handleBack} style={styles.backButtonError}>
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </Pressable>
        </View>
        <ErrorState
          message={error?.message}
          onRetry={refetch}
        />
      </View>
    );
  }

  const photos = issue.photos ?? [];
  const authorities = issue.authorities ?? [];
  const hasVoted = issue.hasVoted ?? false;
  const hasAuthorityWithEmail = authorities.some((a) => a.email);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* Photo Gallery */}
        <PhotoGallery photos={photos} />

        {/* Overlay header — positioned over gallery */}
        <DetailHeader onBack={handleBack} onShare={handleShare} onReport={handleReportIssue} />

        {/* Title + Badges + Meta */}
        <TitleSection issue={issue} />

        {/* Statistics */}
        <StatisticsRow issue={issue} />

        {/* Description */}
        {issue.description ? (
          <SectionBlock title={Localization.detail.description}>
            <ThemedText type="body">{issue.description}</ThemedText>
          </SectionBlock>
        ) : null}

        {/* Desired Outcome */}
        {issue.desiredOutcome ? (
          <SectionBlock title={Localization.detail.desiredOutcome}>
            <ThemedText type="body">{issue.desiredOutcome}</ThemedText>
          </SectionBlock>
        ) : null}

        {/* Community Impact */}
        {issue.communityImpact ? (
          <SectionBlock title={Localization.detail.communityImpact}>
            <ThemedText type="body">{issue.communityImpact}</ThemedText>
          </SectionBlock>
        ) : null}

        {/* Location */}
        <SectionBlock title={Localization.detail.location}>
          <LocationPreview
            latitude={issue.latitude}
            longitude={issue.longitude}
            address={issue.address}
          />
        </SectionBlock>

        {/* Authorities */}
        {authorities.length > 0 ? (
          <View onLayout={handleAuthoritiesLayout}>
            <AuthoritiesSection
              authorities={authorities}
              onSendEmail={handleSendEmail}
            />
          </View>
        ) : null}

        {/* Comments */}
        <CommentsSection
          issueId={issue.id}
          currentUserId={user?.id}
          onReply={handleReply}
          editingCommentId={editingCommentId}
          editText={editText}
          onEditTextChange={handleEditTextChange}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onStartEdit={handleStartEdit}
          expandedThreads={expandedThreads}
          onToggleThread={toggleThread}
          onSortChange={handleSortChange}
          onReport={handleReportComment}
          onBlockUser={handleBlockUser}
          isBlockedUser={isBlocked}
        />

      </ScrollView>

      {/* Sticky Bottom Bar — combined vote/email + comment input */}
      <StickyBottomBar
        issueId={issue.id}
        hasVoted={hasVoted}
        voteCount={issue.communityVotes}
        onEmailCta={handleEmailCta}
        emailDisabled={!hasAuthorityWithEmail}
        replyingTo={replyingTo}
        onClearReply={handleClearReply}
        onReplySuccess={handleReplySuccess}
      />

      {/* Email Confirmation Prompt */}
      <EmailPrompt
        ref={emailPromptRef}
        onConfirm={handleEmailConfirm}
        onDismiss={handleEmailDismiss}
      />

      {/* Report Sheet */}
      <ReportSheet
        ref={reportSheetRef}
        onSubmit={handleReportSubmit}
        isSubmitting={reportTargetType === 'issue' ? isReportingIssue : isReportingComment}
        onClose={() => { setReportTargetType(null); reportTargetTypeRef.current = null; }}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    gap: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  authorityList: {
    gap: Spacing.sm,
  },
  sortToggle: {
    alignSelf: 'flex-end',
  },
  commentLoader: {
    paddingVertical: Spacing.lg,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  bottomBar: {
    flexDirection: 'column',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  bottomBarTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ctaButton: {
    flex: 1,
  },
  backButtonError: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  // Skeleton
  skeleton: {
    flex: 1,
  },
  skeletonPhoto: {
    height: 250,
    width: '100%',
  },
  skeletonContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 16,
    borderRadius: BorderRadius.xs,
    borderCurve: 'continuous',
  },
  skeletonBlock: {
    height: 80,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    marginTop: Spacing.md,
  },
});

const commentThreadStyles = StyleSheet.create({
  thread: {
    gap: Spacing.sm,
  },
});
