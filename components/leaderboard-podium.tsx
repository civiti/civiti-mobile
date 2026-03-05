import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ThemedText } from '@/components/themed-text';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { BrandColors } from '@/constants/theme';
import type { LeaderboardEntry } from '@/types/gamification';

const FIRST_PEDESTAL = 80;
const SECOND_PEDESTAL = 60;
const THIRD_PEDESTAL = 48;

const FIRST_AVATAR = 48;
const OTHER_AVATAR = 40;

// Podium accent colors — one-off decorative values not in the design system
const GOLD = BrandColors.orangeWeb;
const SILVER = 'rgba(192, 192, 192, 1)'; // one-off podium color
const BRONZE = 'rgba(205, 127, 50, 1)'; // one-off podium color

type PodiumConfig = { height: number; color: string; avatar: number };

const CONFIGS: PodiumConfig[] = [
  { height: SECOND_PEDESTAL, color: SILVER, avatar: OTHER_AVATAR },
  { height: FIRST_PEDESTAL, color: GOLD, avatar: FIRST_AVATAR },
  { height: THIRD_PEDESTAL, color: BRONZE, avatar: OTHER_AVATAR },
];

type LeaderboardPodiumProps = {
  entries: LeaderboardEntry[];
};

// ─── Extracted component for stable refs in .map() ──────────────

function PodiumColumn({ entry, config }: { entry: LeaderboardEntry; config: PodiumConfig }) {
  return (
    <View style={styles.column}>
      <Avatar
        uri={entry.user.photoUrl}
        name={entry.user.displayName ?? undefined}
        size={config.avatar}
      />
      <ThemedText type="caption" numberOfLines={1} style={styles.name}>
        {entry.user.displayName ?? ''}
      </ThemedText>
      <ThemedText type="bodyBold">
        {Localization.leaderboard.points(Number.isFinite(entry.points) ? entry.points : 0)}
      </ThemedText>
      <View
        style={[
          styles.pedestal,
          {
            height: config.height,
            backgroundColor: config.color,
          },
        ]}
      >
        <ThemedText type="bodyBold" style={styles.pedestalRank}>
          {Number.isFinite(entry.rank) ? entry.rank : '-'}
        </ThemedText>
      </View>
    </View>
  );
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  // Order: 2nd - 1st - 3rd (visual podium layout)
  const ordered: (LeaderboardEntry | null)[] =
    entries.length >= 3
      ? [entries[1], entries[0], entries[2]]
      : entries.length === 2
        ? [entries[1], entries[0], null]
        : [null, entries[0], null];

  return (
    <View style={styles.container}>
      {ordered.map((entry, i) => {
        if (!entry) return <View key={i} style={styles.column} />;
        const config = CONFIGS[i];
        if (!config) return null;
        return <PodiumColumn key={entry.user.id} entry={entry} config={config} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  name: {
    textAlign: 'center',
  },
  pedestal: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  pedestalRank: {
    color: '#FFFFFF',
  },
});
