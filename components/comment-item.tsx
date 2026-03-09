import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useCommentVote, useDeleteComment } from '@/hooks/use-comments';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/store/auth-context';
import type { CommentResponse } from '@/types/comments';
import { formatTimeAgo } from '@/utils/format-time-ago';

type CommentItemProps = {
  comment: CommentResponse;
  issueId: string;
  currentUserId: string | undefined;
  parentAuthorName: string | null;
  onReply: (comment: CommentResponse) => void;
  onStartEdit: (comment: CommentResponse) => void;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  isReply?: boolean;
  repliesExpanded?: boolean;
  replyCountOverride?: number;
  onToggleReplies?: (commentId: string) => void;
};

export function CommentItem({
  comment,
  issueId,
  currentUserId,
  parentAuthorName,
  onReply,
  onStartEdit,
  isEditing,
  editText,
  onEditTextChange,
  onEditSave,
  onEditCancel,
  isReply = false,
  repliesExpanded,
  replyCountOverride,
  onToggleReplies,
}: CommentItemProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  const { requireAuth } = useAuth();
  const { mutate: toggleVote, isPending: isVotePending } = useCommentVote(issueId, comment.id);
  const { mutate: deleteCommentFn, isPending: isDeletePending } = useDeleteComment(issueId);

  const isOwn = currentUserId != null && comment.user.id === currentUserId;

  const handleVote = useCallback(() => {
    if (isVotePending) return;
    requireAuth(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      toggleVote(comment.hasVoted);
    });
  }, [isVotePending, requireAuth, toggleVote, comment.hasVoted]);

  const handleReply = useCallback(() => {
    requireAuth(() => {
      onReply(comment);
    });
  }, [requireAuth, onReply, comment]);

  const handleEdit = useCallback(() => {
    onStartEdit(comment);
  }, [onStartEdit, comment]);

  const handleDelete = useCallback(() => {
    if (isDeletePending) return;
    Alert.alert(
      Localization.comments.deleteConfirmTitle,
      Localization.comments.deleteConfirmMessage,
      [
        { text: Localization.actions.cancel, style: 'cancel' },
        {
          text: Localization.comments.deleteConfirmYes,
          style: 'destructive',
          onPress: () => {
            deleteCommentFn(comment.id);
          },
        },
      ],
    );
  }, [isDeletePending, deleteCommentFn, comment.id]);

  const handleToggleReplies = useCallback(() => {
    onToggleReplies?.(comment.id);
  }, [onToggleReplies, comment.id]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: surface,
          borderColor: border,
        },
        isReply && styles.replyContainer,
      ]}
    >
      {/* Reply-to indicator — hidden for orphan replies where parent is off-page */}
      {comment.parentCommentId && parentAuthorName ? (
        <View style={styles.replyIndicator}>
          <View style={[styles.replyLine, { backgroundColor: accent }]} />
          <ThemedText type="caption" style={{ color: textSecondary }}>
            {Localization.comments.replyIndicator(parentAuthorName)}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.row}>
        <Avatar
          uri={comment.user.photoUrl}
          name={comment.user.displayName ?? undefined}
          size={32}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="bodyBold" style={styles.name} numberOfLines={1}>
              {comment.user.displayName ?? '?'}
            </ThemedText>
            {comment.user.level > 0 ? (
              <ThemedText type="caption" style={{ color: textSecondary }}>
                {Localization.comments.level} {comment.user.level}
              </ThemedText>
            ) : null}
            <ThemedText type="caption" style={{ color: textSecondary }}>
              · {formatTimeAgo(comment.createdAt)}
            </ThemedText>
            {comment.isEdited && !comment.isDeleted ? (
              <ThemedText type="caption" style={{ color: textSecondary }}>
                {Localization.comments.edited}
              </ThemedText>
            ) : null}
          </View>

          {/* Content or inline edit */}
          {comment.isDeleted ? (
            <ThemedText type="body" style={{ color: textSecondary, fontStyle: 'italic' }}>
              {Localization.comments.deleted}
            </ThemedText>
          ) : isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                accessibilityLabel={Localization.comments.placeholder}
                style={[
                  styles.editInput,
                  {
                    color: textColor,
                    borderColor: accent,
                    backgroundColor: surface,
                  },
                ]}
                value={editText}
                onChangeText={onEditTextChange}
                multiline
                maxLength={2000}
                autoFocus
              />
              <View style={styles.editActions}>
                <Pressable onPress={onEditCancel} hitSlop={12} style={styles.editActionButton}>
                  <ThemedText type="caption" style={{ color: textSecondary }}>
                    {Localization.comments.editCancel}
                  </ThemedText>
                </Pressable>
                <Pressable onPress={onEditSave} hitSlop={12} style={styles.editActionButton}>
                  <ThemedText type="caption" style={{ color: accent }}>
                    {Localization.comments.editSave}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <ThemedText type="body">{comment.content ?? ''}</ThemedText>
          )}

          {/* Action row — only for non-deleted, non-editing comments */}
          {!comment.isDeleted && !isEditing ? (
            <View style={styles.actionRow}>
              {/* Helpful vote */}
              <Pressable
                onPress={handleVote}
                style={styles.actionButton}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${comment.helpfulCount} ${Localization.comments.helpful}`}
              >
                <IconSymbol
                  name={comment.hasVoted ? 'hand.thumbsup.fill' : 'hand.thumbsup'}
                  size={16}
                  color={comment.hasVoted ? accent : textSecondary}
                />
                {comment.helpfulCount > 0 ? (
                  <ThemedText
                    type="caption"
                    style={{ color: comment.hasVoted ? accent : textSecondary }}
                  >
                    {comment.helpfulCount}
                  </ThemedText>
                ) : null}
              </Pressable>

              {/* Reply (top-level only — nested replies aren't rendered) */}
              {!isReply ? (
                <Pressable
                  onPress={handleReply}
                  style={styles.actionButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={Localization.comments.replyAction}
                >
                  <IconSymbol name="arrowshape.turn.up.left" size={16} color={textSecondary} />
                  <ThemedText type="caption" style={{ color: textSecondary }}>
                    {Localization.comments.replyAction}
                  </ThemedText>
                </Pressable>
              ) : null}

              {/* Edit (own only) */}
              {isOwn ? (
                <Pressable
                  onPress={handleEdit}
                  style={styles.actionButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={Localization.actions.edit}
                >
                  <IconSymbol name="pencil" size={16} color={textSecondary} />
                </Pressable>
              ) : null}

              {/* Delete (own only) */}
              {isOwn ? (
                <Pressable
                  onPress={handleDelete}
                  style={styles.actionButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={Localization.actions.delete}
                >
                  <IconSymbol name="trash" size={16} color={textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Reply count toggle (top-level comments only) */}
          {onToggleReplies && (replyCountOverride ?? comment.replyCount) > 0 && !isReply ? (
            <Pressable
              onPress={handleToggleReplies}
              style={styles.replyToggle}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                repliesExpanded
                  ? Localization.comments.hideReplies
                  : Localization.comments.showReplies(replyCountOverride ?? comment.replyCount)
              }
            >
              <IconSymbol
                name={repliesExpanded ? 'chevron.up' : 'chevron.down'}
                size={12}
                color={accent}
              />
              <ThemedText type="caption" style={{ color: accent }}>
                {repliesExpanded
                  ? Localization.comments.hideReplies
                  : Localization.comments.showReplies(replyCountOverride ?? comment.replyCount)}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  replyContainer: {
    marginLeft: Spacing['2xl'],
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  replyLine: {
    width: 2,
    height: Spacing.md,
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 32,
    minWidth: 44,
  },
  replyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    minHeight: 32,
    minWidth: 44,
  },
  editContainer: {
    gap: Spacing.sm,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    padding: Spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  editActionButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
