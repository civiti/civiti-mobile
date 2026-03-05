import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { IssueStatus } from '@/constants/enums';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { StatusBadgeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StatusBadgeProps = {
  status: IssueStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = StatusBadgeColors[scheme][status];

  if (!colors) {
    if (__DEV__) console.warn(`[StatusBadge] Unknown status "${status}"`);
    const fallback = StatusBadgeColors[scheme].Draft;
    return (
      <View style={[styles.badge, { backgroundColor: fallback.bg, borderColor: fallback.border }]}>
        <ThemedText type="badge" style={{ color: fallback.fg }}>
          {Localization.status[status as keyof typeof Localization.status] ?? status}
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <ThemedText type="badge" style={{ color: colors.fg }}>
        {Localization.status[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
