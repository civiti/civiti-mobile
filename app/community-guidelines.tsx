import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CommunityGuidelinesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ThemedView style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={handleBack}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={Localization.actions.back}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </Pressable>
        <ThemedText type="h2" accessibilityRole="header">
          {Localization.communityGuidelines.title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <ThemedText type="body">{Localization.communityGuidelines.intro}</ThemedText>

        {Localization.communityGuidelines.rules.map((rule, index) => (
          <View key={rule.title} style={styles.rule}>
            <ThemedText type="bodyBold">
              {index + 1}. {rule.title}
            </ThemedText>
            <ThemedText type="body">{rule.body}</ThemedText>
          </View>
        ))}

        <ThemedText type="body">{Localization.communityGuidelines.footer}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  rule: {
    gap: Spacing.xs,
  },
});
