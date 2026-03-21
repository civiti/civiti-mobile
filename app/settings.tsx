import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Toggle } from '@/components/ui/toggle';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/api';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useProfile } from '@/hooks/use-profile';
import { useThemeColor } from '@/hooks/use-theme-color';
import { deregisterAndCleanupPushToken } from '@/services/notifications';
import { deleteUserAccount, updateUserProfile } from '@/services/user';
import { useAuth } from '@/store/auth-context';

type ToggleField =
  | 'issueUpdatesEnabled'
  | 'communityNewsEnabled'
  | 'monthlyDigestEnabled'
  | 'achievementsEnabled';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { data, isLoading, isError, refetch } = useProfile();

  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Local toggle state (optimistic)
  const [issueUpdates, setIssueUpdates] = useState(true);
  const [communityNews, setCommunityNews] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(true);
  const [achievements, setAchievements] = useState(true);

  // Initialize from profile data
  useEffect(() => {
    if (data) {
      setIssueUpdates(data.issueUpdatesEnabled ?? true);
      setCommunityNews(data.communityNewsEnabled ?? true);
      setMonthlyDigest(data.monthlyDigestEnabled ?? true);
      setAchievements(data.achievementsEnabled ?? true);
    }
  }, [data]);

  const { mutate: saveToggle } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (err, variables) => {
      console.warn('[settings] Toggle save failed:', err);
      Alert.alert(Localization.settings.toggleFailed);
      // Revert optimistic update
      if (variables.issueUpdatesEnabled !== undefined) setIssueUpdates(!variables.issueUpdatesEnabled);
      if (variables.communityNewsEnabled !== undefined) setCommunityNews(!variables.communityNewsEnabled);
      if (variables.monthlyDigestEnabled !== undefined) setMonthlyDigest(!variables.monthlyDigestEnabled);
      if (variables.achievementsEnabled !== undefined) setAchievements(!variables.achievementsEnabled);
    },
  });

  const handleToggle = useCallback(
    (field: ToggleField, value: boolean) => {
      // Optimistic: state is already set via individual setter
      saveToggle({ [field]: value });
    },
    [saveToggle],
  );

  const handleIssueUpdates = useCallback((v: boolean) => {
    setIssueUpdates(v);
    handleToggle('issueUpdatesEnabled', v);
  }, [handleToggle]);

  const handleCommunityNews = useCallback((v: boolean) => {
    setCommunityNews(v);
    handleToggle('communityNewsEnabled', v);
  }, [handleToggle]);

  const handleMonthlyDigest = useCallback((v: boolean) => {
    setMonthlyDigest(v);
    handleToggle('monthlyDigestEnabled', v);
  }, [handleToggle]);

  const handleAchievementsToggle = useCallback((v: boolean) => {
    setAchievements(v);
    handleToggle('achievementsEnabled', v);
  }, [handleToggle]);

  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      deregisterAndCleanupPushToken()
        .then(() => signOut())
        .then(({ error }) => {
          if (error) {
            console.warn('[settings] Sign out after delete failed:', error);
          }
          // Account is already deleted — always clear and navigate
          queryClient.clear();
          router.replace('/');
        })
        .catch((err) => {
          console.warn('[settings] Sign out unexpected error:', err);
          queryClient.clear();
          router.replace('/');
        });
    },
    onError: (err) => {
      console.warn('[settings] Delete account failed:', err);
      Alert.alert(Localization.settings.deleteFailed);
    },
  });

  const handleDeleteAccount = useCallback(() => {
    if (isDeleting) return;
    Alert.alert(
      Localization.settings.deleteConfirmTitle,
      Localization.settings.deleteConfirmMessage,
      [
        { text: Localization.actions.cancel, style: 'cancel' },
        {
          text: Localization.settings.deleteConfirmYes,
          style: 'destructive',
          onPress: () => deleteAccount(),
        },
      ],
    );
  }, [isDeleting, deleteAccount]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <LoadingSkeleton />
      </ThemedView>
    );
  }

  if (isError || !data) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <ErrorState onRetry={() => { void refetch(); }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText type="h3">{Localization.settings.notificationsSection}</ThemedText>
          <View
            style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          >
            <Toggle
              label={Localization.settings.issueUpdates}
              value={issueUpdates}
              onValueChange={handleIssueUpdates}
            />
            <Toggle
              label={Localization.settings.communityNews}
              value={communityNews}
              onValueChange={handleCommunityNews}
            />
            <Toggle
              label={Localization.settings.monthlyDigest}
              value={monthlyDigest}
              onValueChange={handleMonthlyDigest}
            />
            <Toggle
              label={Localization.settings.achievementsNotif}
              value={achievements}
              onValueChange={handleAchievementsToggle}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <ThemedText type="h3">{Localization.settings.accountSection}</ThemedText>
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/blocked-users')}
              hitSlop={4}
              accessibilityRole="button"
            >
              <ThemedText type="body">{Localization.settings.blockedUsersRow}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={textColor} />
            </Pressable>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <ThemedText type="h3">{Localization.settings.legalSection}</ThemedText>
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Pressable
              style={styles.linkRow}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => Alert.alert(Localization.errors.generic))}
              hitSlop={4}
              accessibilityRole="link"
            >
              <ThemedText type="body">{Localization.settings.privacyPolicy}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={textColor} />
            </Pressable>
            <View style={[styles.rowDivider, { backgroundColor: borderColor }]} />
            <Pressable
              style={styles.linkRow}
              onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL).catch(() => Alert.alert(Localization.errors.generic))}
              hitSlop={4}
              accessibilityRole="link"
            >
              <ThemedText type="body">{Localization.settings.termsOfService}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={textColor} />
            </Pressable>
            <View style={[styles.rowDivider, { backgroundColor: borderColor }]} />
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/community-guidelines')}
              hitSlop={4}
              accessibilityRole="button"
            >
              <ThemedText type="body">{Localization.settings.communityGuidelines}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={textColor} />
            </Pressable>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <ThemedText type="h3">{Localization.settings.dangerSection}</ThemedText>
          <Button
            variant="danger"
            title={Localization.settings.deleteAccount}
            onPress={handleDeleteAccount}
            isLoading={isDeleting}
            disabled={isDeleting}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ─── Screen Header ─────────────────────────────────────────────

function ScreenHeader({
  onBack,
  textColor,
  topInset,
}: {
  onBack: () => void;
  textColor: string;
  topInset: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + Spacing.sm }]}>
      <Pressable
        onPress={onBack}
        style={styles.headerButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={Localization.actions.back}
      >
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </Pressable>
      <ThemedText type="h2" accessibilityRole="header">
        {Localization.settings.title}
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
  },
  section: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
