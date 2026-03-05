import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { IssueAuthorityResponse } from '@/types/issues';

type AuthorityCardProps = {
  authority: IssueAuthorityResponse;
  onSendEmail: (authority: IssueAuthorityResponse) => void;
};

export function AuthorityCard({ authority, onSendEmail }: AuthorityCardProps) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const surface = useThemeColor({}, 'surfaceElevated');
  const border = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const primaryText = Colors[scheme].primary;

  const handleEmailPress = useCallback(() => {
    onSendEmail(authority);
  }, [onSendEmail, authority]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface, borderColor: border },
      ]}
    >
      <View style={styles.info}>
        <IconSymbol name="person.circle.fill" size={20} color={textSecondary} />
        <View style={styles.textContainer}>
          <ThemedText type="bodyBold" numberOfLines={1}>
            {authority.name ?? Localization.authority.defaultName}
          </ThemedText>
          {authority.email ? (
            <ThemedText
              type="caption"
              style={{ color: textSecondary }}
              numberOfLines={1}
            >
              {authority.email}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={handleEmailPress}
        disabled={!authority.email}
        hitSlop={{ top: 4, bottom: 4 }}
        style={({ pressed }) => [
          styles.emailButton,
          {
            backgroundColor: authority.email ? accent : border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          authority.email
            ? `${Localization.authority.sendEmail} ${authority.name}`
            : Localization.authority.noEmail
        }
      >
        <IconSymbol
          name="envelope.fill"
          size={16}
          color={authority.email ? primaryText : textSecondary}
        />
        <ThemedText
          type="label"
          style={{
            color: authority.email ? primaryText : textSecondary,
            textTransform: 'none',
          }}
        >
          {authority.email
            ? Localization.authority.sendEmail
            : Localization.authority.noEmail}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xxs,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.lg,
  },
});
