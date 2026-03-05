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
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
