import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  options: RadioOption[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
};

function RadioOptionItem({
  option,
  isSelected,
  borderColor,
  accent,
  onPress,
}: {
  option: RadioOption;
  isSelected: boolean;
  borderColor: string;
  accent: string;
  onPress: (value: string) => void;
}) {
  const handlePress = useCallback(() => onPress(option.value), [onPress, option.value]);

  return (
    <Pressable
      style={styles.row}
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option.label}
    >
      <View style={[styles.outerCircle, { borderColor: isSelected ? accent : borderColor }]}>
        {isSelected && <View style={[styles.innerCircle, { backgroundColor: accent }]} />}
      </View>
      <ThemedText type="body">{option.label}</ThemedText>
    </Pressable>
  );
}

export function RadioGroup({ options, selectedValue, onValueChange }: RadioGroupProps) {
  const borderColor = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {options.map((option) => (
        <RadioOptionItem
          key={option.value}
          option={option}
          isSelected={option.value === selectedValue}
          borderColor={borderColor}
          accent={accent}
          onPress={onValueChange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
