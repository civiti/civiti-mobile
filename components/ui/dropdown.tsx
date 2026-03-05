import { useCallback, useRef } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { ThemedText } from '@/components/themed-text';
import {
  ThemedBottomSheet,
  type BottomSheetMethods,
} from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function Dropdown({
  options,
  selectedValue,
  onValueChange,
  label,
  placeholder = '',
  disabled = false,
}: DropdownProps) {
  const sheetRef = useRef<BottomSheetMethods>(null);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const disabledBg = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');

  const selectedLabel = options.find((o) => o.value === selectedValue)?.label;

  const openSheet = useCallback(() => {
    if (!disabled) {
      Keyboard.dismiss();
      sheetRef.current?.expand();
    }
  }, [disabled]);

  const handleSelect = useCallback(
    (value: string) => {
      onValueChange(value);
      sheetRef.current?.close();
    },
    [onValueChange],
  );

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="label" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}

      <Pressable
        style={[
          styles.trigger,
          {
            backgroundColor: disabled ? disabledBg : backgroundColor,
            borderColor,
          },
        ]}
        onPress={openSheet}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={placeholder}
      >
        <ThemedText
          type="body"
          style={[
            styles.triggerText,
            { color: selectedLabel ? textColor : placeholderColor },
          ]}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </ThemedText>
        <IconSymbol name="chevron.down" size={20} color={placeholderColor} />
      </Pressable>

      <ThemedBottomSheet ref={sheetRef} snapPoints={['40%']}>
        <BottomSheetScrollView contentContainerStyle={styles.listContent}>
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <ThemedText
                  type="body"
                  style={[
                    styles.optionText,
                    isSelected && { color: accent },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {isSelected && (
                  <IconSymbol
                    name="checkmark"
                    size={20}
                    color={accent}
                  />
                )}
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </ThemedBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    marginBottom: Spacing.xxs,
  },
  trigger: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
});
