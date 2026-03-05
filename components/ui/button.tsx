import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Colors } from '@/constants/theme';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  title: string;
  isLoading?: boolean;
  size?: 'default' | 'small';
  style?: StyleProp<ViewStyle>;
};

type VariantStyle = { bg: string; text: string; pressed: string; border: string };

const VARIANT_COLORS: Record<'light' | 'dark', Record<ButtonVariant, VariantStyle>> = {
  light: {
    primary:   { bg: BrandColors.orangeWeb, text: BrandColors.oxfordBlue, pressed: BrandColors.orangeWeb90, border: 'transparent' },
    secondary: { bg: BrandColors.white, text: BrandColors.oxfordBlue, pressed: BrandColors.platinum, border: BrandColors.platinum },
    ghost:     { bg: 'transparent', text: BrandColors.oxfordBlue, pressed: BrandColors.orangeWeb20, border: 'transparent' },
    danger:    { bg: Colors.light.error, text: BrandColors.white, pressed: 'rgba(220, 53, 69, 0.9)', border: 'transparent' },
  },
  dark: {
    primary:   { bg: BrandColors.orangeWeb, text: BrandColors.oxfordBlue, pressed: BrandColors.orangeWeb90, border: 'transparent' },
    secondary: { bg: Colors.dark.surfaceElevated, text: Colors.dark.text, pressed: Colors.dark.pressed, border: Colors.dark.border },
    ghost:     { bg: 'transparent', text: Colors.dark.text, pressed: BrandColors.orangeWeb20, border: 'transparent' },
    danger:    { bg: Colors.dark.error, text: BrandColors.oxfordBlue, pressed: '#D46060', border: 'transparent' },
  },
};

export function Button({
  variant = 'primary',
  title,
  isLoading = false,
  size = 'default',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = VARIANT_COLORS[scheme][variant];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.default,
        {
          backgroundColor: pressed ? colors.pressed : colors.bg,
          borderColor: colors.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <ThemedText
          type={size === 'small' ? 'label' : 'button'}
          style={{ color: colors.text }}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  default: {
    height: 48,
    minWidth: 48,
  },
  small: {
    height: 36,
    minWidth: 36,
  },
});
