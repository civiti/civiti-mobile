import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ThemedText } from '@/components/themed-text';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { BrandColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/types/gamification';

type LeaderboardEntryProps = {
  entry: LeaderboardEntryType;
  isCurrentUser?: boolean;
};

export function LeaderboardEntry({ entry, isCurrentUser }: LeaderboardEntryProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrentUser ? BrandColors.orangeWeb20 : surfaceColor,
          borderBottomColor: borderColor,
        },
      ]}
    >
      <ThemedText type="bodyBold" style={styles.rank}>
        {Number.isFinite(entry.rank) ? entry.rank : '-'}
      </ThemedText>
      <Avatar
        uri={entry.user.photoUrl}
        name={entry.user.displayName ?? undefined}
        size={32}
      />
      <View style={styles.info}>
        <ThemedText type="body" numberOfLines={1}>
          {entry.user.displayName ?? ''}
        </ThemedText>
        {entry.user.city && (
          <ThemedText type="caption" numberOfLines={1}>
            {entry.user.city}
          </ThemedText>
        )}
      </View>
      <View style={styles.right}>
        <ThemedText type="bodyBold">
          {Localization.leaderboard.points(Number.isFinite(entry.points) ? entry.points : 0)}
        </ThemedText>
        <View style={[styles.levelChip, { backgroundColor: BrandColors.orangeWeb20 }]}>
          <ThemedText type="caption" style={{ color: tintColor }}>
            {Localization.leaderboard.level(Number.isFinite(entry.level) ? entry.level : 0)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderCurve: 'continuous',
  },
  rank: {
    width: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  levelChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    borderCurve: 'continuous',
  },
});
