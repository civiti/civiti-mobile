import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useCreateComment } from '@/hooks/use-comments';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/store/auth-context';
import type { CommentResponse } from '@/types/comments';

type CommentInputBarProps = {
  issueId: string;
  replyingTo: CommentResponse | null;
  onClearReply: () => void;
  onReplySuccess?: (parentCommentId: string) => void;
};

export function CommentInputBar({ issueId, replyingTo, onClearReply, onReplySuccess }: CommentInputBarProps) {
  const [text, setText] = useState('');
  const accent = useThemeColor({}, 'accent');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');

  const { requireAuth } = useAuth();
  const { mutate: createCommentFn, isPending } = useCreateComment(issueId);

  const canSend = text.trim().length > 0 && !isPending;

  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content || isPending) return;
    requireAuth(() => {
      createCommentFn(
        {
          content,
          parentCommentId: replyingTo?.id ?? null,
        },
        {
          onSuccess: () => {
            setText('');
            if (replyingTo?.id) onReplySuccess?.(replyingTo.id);
            onClearReply();
          },
        },
      );
    });
  }, [text, isPending, requireAuth, createCommentFn, replyingTo?.id, onClearReply, onReplySuccess]);

  return (
    <View style={styles.container}>
      {/* Reply chip */}
      {replyingTo ? (
        <View style={[styles.replyChip, { backgroundColor: border }]}>
          <ThemedText type="caption" numberOfLines={1} style={styles.replyChipText}>
            {Localization.comments.replyingTo(replyingTo.user.displayName ?? '?')}
          </ThemedText>
          <Pressable
            onPress={onClearReply}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={Localization.actions.close}
          >
            <IconSymbol name="xmark" size={14} color={textSecondary} />
          </Pressable>
        </View>
      ) : null}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: border,
              backgroundColor: surface,
            },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={Localization.comments.placeholder}
          placeholderTextColor={tabIconDefault}
          multiline
          maxLength={2000}
          editable={!isPending}
          accessibilityLabel={Localization.comments.placeholder}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={styles.sendButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={Localization.comments.send}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={accent} />
          ) : (
            <IconSymbol
              name="paperplane.fill"
              size={22}
              color={canSend ? accent : tabIconDefault}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  replyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    borderCurve: 'continuous',
  },
  replyChipText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
