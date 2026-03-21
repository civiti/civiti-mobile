import { useCallback, useMemo } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { AchievementCard } from '@/components/achievement-card';
import { BadgeCard } from '@/components/badge-card';
import { ErrorState } from '@/components/error-state';
import { ProfileSkeleton } from '@/components/profile-skeleton';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { BrandColors } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useThemeColor } from '@/hooks/use-theme-color';
import { deregisterAndCleanupPushToken } from '@/services/notifications';
import { useAuth } from '@/store/auth-context';

const AVATAR_SIZE = 80;
const MAX_RECENT_BADGES = 5;
const MAX_ACTIVE_ACHIEVEMENTS = 3;

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { session, signOut } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useProfile();
  const gamification = data?.gamification ?? null;

  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');

  const recentBadges = useMemo(
    () => gamification?.recentBadges?.slice(0, MAX_RECENT_BADGES) ?? [],
    [gamification?.recentBadges],
  );

  const activeAchievements = useMemo(
    () => gamification?.activeAchievements?.slice(0, MAX_ACTIVE_ACHIEVEMENTS) ?? [],
    [gamification?.activeAchievements],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      Localization.profile.logoutConfirmTitle,
      Localization.profile.logoutConfirmMessage,
      [
        { text: Localization.actions.cancel, style: 'cancel' },
        {
          text: Localization.profile.logoutConfirmYes,
          style: 'destructive',
          onPress: () => {
            deregisterAndCleanupPushToken()
              .catch(() => {})
              .then(() => signOut())
              .then(({ error }) => {
                if (error) {
                  console.warn('[profile] Logout failed:', error);
                  Alert.alert(Localization.errors.generic);
                  return;
                }
                queryClient.clear();
                router.replace('/');
              })
              .catch((err) => console.warn('[profile] Logout unexpected error:', err));
          },
        },
      ],
    );
  }, [signOut]);

  const handleEditProfile = useCallback(() => {
    router.push('/edit-profile' as any);
  }, []);

  const handleLeaderboard = useCallback(() => {
    router.push('/leaderboard' as any);
  }, []);

  const handleSettings = useCallback(() => {
    router.push('/settings' as any);
  }, []);

  if (!session) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="body">{Localization.profile.loginRequired}</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ProfileSkeleton />
      </ThemedView>
    );
  }

  if (isError || !data) {
    return (
      <ThemedView style={styles.flex}>
        <ErrorState onRetry={() => { void refetch(); }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={tintColor} />
        }
      >
        {/* ─── Profile Header ─────────────────────── */}
        <View style={styles.header}>
          <Avatar uri={data.photoUrl} name={data.displayName ?? undefined} size={AVATAR_SIZE} />
          <ThemedText type="h1" accessibilityRole="header">{data.displayName ?? ''}</ThemedText>
          <ThemedText type="caption" style={{ color: textSecondaryColor }}>
            {data.email ?? ''}
          </ThemedText>
          {gamification && (
            <View style={[styles.levelChip, { backgroundColor: BrandColors.orangeWeb20 }]}>
              <IconSymbol name="star.fill" size={14} color={tintColor} />
              <ThemedText type="caption" style={{ color: tintColor }}>
                {Localization.profile.levelBadge(gamification.level)}
              </ThemedText>
            </View>
          )}
          {gamification && (
            <ThemedText type="caption" style={{ color: textSecondaryColor }}>
              {Localization.profile.points(gamification.points)}
            </ThemedText>
          )}
        </View>

        {/* ─── Level Progress ─────────────────────── */}
        {gamification && (
          <View style={styles.section}>
            <View style={styles.progressLabelRow}>
              <ThemedText type="caption">{Localization.profile.levelProgress}</ThemedText>
              <ThemedText type="caption" style={{ color: textSecondaryColor }}>
                {Localization.profile.pointsToNext(gamification.pointsToNextLevel)}
              </ThemedText>
            </View>
            <ProgressBar progress={gamification.levelProgressPercentage / 100} />
          </View>
        )}

        {/* ─── Stats Grid ─────────────────────────── */}
        {gamification && (
          <View style={styles.section}>
            <ThemedText type="h3">{Localization.profile.statsTitle}</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  icon="doc.text.fill"
                  value={gamification.issuesReported}
                  label={Localization.profile.issuesReported}
                />
                <StatCard
                  icon="checkmark.circle.fill"
                  value={gamification.issuesResolved}
                  label={Localization.profile.issuesResolved}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  icon="heart.fill"
                  value={gamification.communityVotes}
                  label={Localization.profile.communityVotes}
                />
                <StatCard
                  icon="flame.fill"
                  value={gamification.currentLoginStreak}
                  label={Localization.profile.loginStreak}
                />
              </View>
            </View>
          </View>
        )}

        {/* ─── Recent Badges ──────────────────────── */}
        {gamification && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="h3">{Localization.profile.badgesTitle}</ThemedText>
              {recentBadges.length > 0 && (
                <Pressable
                  onPress={() => router.push('/badges' as any)}
                  hitSlop={8}
                >
                  <ThemedText type="caption" style={{ color: tintColor }}>
                    {Localization.profile.badgesViewAll} →
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {recentBadges.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesRow}
              >
                {recentBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </ScrollView>
            ) : (
              <ThemedText type="caption" style={{ color: textSecondaryColor }}>
                {Localization.profile.badgesEmpty}
              </ThemedText>
            )}
          </View>
        )}

        {/* ─── Active Achievements ────────────────── */}
        {gamification && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="h3">{Localization.profile.achievementsTitle}</ThemedText>
              {activeAchievements.length > 0 && (
                <Pressable
                  onPress={() => router.push('/achievements' as any)}
                  hitSlop={8}
                >
                  <ThemedText type="caption" style={{ color: tintColor }}>
                    {Localization.profile.achievementsViewAll} →
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {activeAchievements.length > 0 ? (
              <View style={styles.achievementsList}>
                {activeAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </View>
            ) : (
              <ThemedText type="caption" style={{ color: textSecondaryColor }}>
                {Localization.profile.achievementsEmpty}
              </ThemedText>
            )}
          </View>
        )}

        {/* ─── Gamification Unavailable ─────────────── */}
        {!gamification && (
          <ThemedText type="caption" style={{ color: textSecondaryColor, textAlign: 'center' }}>
            {Localization.profile.gamificationUnavailable}
          </ThemedText>
        )}

        {/* ─── Quick Actions ──────────────────────── */}
        <View style={styles.section}>
          <ActionRow
            icon="pencil"
            label={Localization.profile.editProfile}
            onPress={handleEditProfile}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
            textSecondaryColor={textSecondaryColor}
          />
          <ActionRow
            icon="chart.bar.fill"
            label={Localization.profile.leaderboard}
            onPress={handleLeaderboard}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
            textSecondaryColor={textSecondaryColor}
          />
          <ActionRow
            icon="gearshape.fill"
            label={Localization.profile.settings}
            onPress={handleSettings}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
            textSecondaryColor={textSecondaryColor}
          />
          <ActionRow
            icon="rectangle.portrait.and.arrow.right"
            label={Localization.profile.logout}
            onPress={handleLogout}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
            textSecondaryColor={textSecondaryColor}
            danger
            dangerColor={errorColor}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ─── Action Row Component ─────────────────────────────────────

type ActionRowProps = {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  label: string;
  onPress: () => void;
  surfaceColor: string;
  borderColor: string;
  textSecondaryColor: string;
  danger?: boolean;
  dangerColor?: string;
};

function ActionRow({
  icon,
  label,
  onPress,
  surfaceColor,
  borderColor,
  textSecondaryColor,
  danger,
  dangerColor,
}: ActionRowProps) {
  const iconColor = danger ? dangerColor ?? textSecondaryColor : textSecondaryColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        {
          backgroundColor: surfaceColor,
          borderColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconSymbol name={icon} size={22} color={iconColor} />
      <ThemedText
        type="body"
        style={[styles.actionLabel, danger && { color: dangerColor }]}
      >
        {label}
      </ThemedText>
      <IconSymbol name="chevron.right" size={18} color={textSecondaryColor} />
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
    gap: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderCurve: 'continuous',
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badgesRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  achievementsList: {
    gap: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    gap: Spacing.md,
  },
  actionLabel: {
    flex: 1,
  },
});
