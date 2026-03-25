import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { BrandColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  accessibilityLabel?: string;
};

export function Checkbox({ checked, onToggle, label, accessibilityLabel }: CheckboxProps) {
  const borderColor = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');

  return (
    <Pressable
      style={styles.row}
      onPress={onToggle}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View
        style={[
          styles.box,
          checked
            ? { backgroundColor: accent, borderColor: accent }
            : { borderColor },
        ]}
      >
        {checked && (
          <IconSymbol name="checkmark" size={16} color={BrandColors.oxfordBlue} />
        )}
      </View>
      {label ? <ThemedText type="body" style={styles.label}>{label}</ThemedText> : null}
    </Pressable>
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
  box: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs,
    borderCurve: 'continuous',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
