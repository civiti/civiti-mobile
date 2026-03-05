import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { UrgencyLevel } from '@/constants/enums';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { UrgencyBadgeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type UrgencyBadgeProps = {
  level: UrgencyLevel;
};

export function UrgencyBadge({ level }: UrgencyBadgeProps) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = UrgencyBadgeColors[scheme][level];
  if (!colors) console.warn(`[UrgencyBadge] Unknown level "${level}", falling back to Low`);
  const resolvedColors = colors ?? UrgencyBadgeColors[scheme].Low;

  return (
    <View style={[styles.badge, { backgroundColor: resolvedColors.bg }]}>
      <ThemedText type="badge" style={{ color: resolvedColors.fg }}>
        {Localization.urgency[level] ?? Localization.urgency.Low}
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
    alignSelf: 'flex-start',
  },
});
