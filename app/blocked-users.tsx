import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useBlockedUsers, useUnblockUser } from '@/hooks/use-blocked-users';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { BlockedUser } from '@/types/blocked-users';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const { blockedUsers, isLoading, isError, refetch } = useBlockedUsers();
  const { mutate: unblock } = useUnblockUser();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleUnblock = useCallback(
    (userId: string) => {
      setUnblockingId(userId);
      unblock(userId, {
        onSettled: () => setUnblockingId(null),
      });
    },
    [unblock],
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUser }) => (
      <View style={[styles.item, { backgroundColor: surfaceColor, borderColor }]}>
        <Avatar uri={item.photoUrl} name={item.displayName} size={40} />
        <View style={styles.itemContent}>
          <ThemedText type="bodyBold" numberOfLines={1}>
            {item.displayName}
          </ThemedText>
        </View>
        <Button
          variant="ghost"
          title={Localization.blockedUsers.unblock}
          onPress={() => handleUnblock(item.userId)}
          disabled={unblockingId === item.userId}
          isLoading={unblockingId === item.userId}
          size="small"
        />
      </View>
    ),
    [surfaceColor, borderColor, handleUnblock, unblockingId],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <ThemedText type="body" style={{ color: textSecondary }}>
          {Localization.blockedUsers.empty}
        </ThemedText>
      </View>
    ),
    [textSecondary],
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ScreenHeader onBack={handleBack} textColor={textColor} topInset={insets.top} />
        <LoadingSkeleton />
      </ThemedView>
    );
  }

  if (isError) {
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
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
}

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
        {Localization.blockedUsers.title}
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  itemContent: {
    flex: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
});
