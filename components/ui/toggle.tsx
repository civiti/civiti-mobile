import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
};

export function Toggle({ value, onValueChange, label }: ToggleProps) {
  const borderColor = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');

  return (
    <View style={styles.row}>
      <ThemedText type="body" style={styles.label}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: borderColor, true: accent }}
        thumbColor={surface}
        accessibilityRole="switch"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  label: {
    flex: 1,
  },
});
