import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryBadge } from '@/components/ui/category-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Shadows, Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { IssueListResponse } from '@/types/issues';

type IssueMiniCardProps = {
  issue: IssueListResponse;
  onPress: () => void;
  onClose: () => void;
};

const THUMBNAIL_SIZE = 80;

export function IssueMiniCard({ issue, onPress, onClose }: IssueMiniCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const secondaryText = useThemeColor({}, 'textSecondary');

  return (
    <View style={[styles.wrapper, { backgroundColor: Colors[scheme].surface }, Shadows.md]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={issue.title ?? undefined}
      >
        {/* Thumbnail */}
        {issue.mainPhotoUrl ? (
          <Image
            source={{ uri: issue.mainPhotoUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
            recyclingKey={issue.id}
            accessibilityIgnoresInvertColors
            accessibilityLabel={issue.title ?? 'Issue photo'}
          />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: Colors[scheme].border }]} />
        )}

        {/* Content */}
        <View style={styles.content}>
          <ThemedText type="bodyBold" numberOfLines={2}>
            {issue.title}
          </ThemedText>
          <CategoryBadge category={issue.category} />
          {issue.address && (
            <View style={styles.addressRow}>
              <IconSymbol
                name="mappin.circle.fill"
                size={14}
                color={secondaryText}
              />
              <ThemedText
                type="caption"
                style={{ color: secondaryText }}
                numberOfLines={1}
              >
                {issue.address}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>

      {/* Close button */}
      <Pressable
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={Localization.actions.close}
      >
        <IconSymbol
          name="xmark.circle.fill"
          size={22}
          color={secondaryText}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
  },
  card: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderTopLeftRadius: BorderRadius.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
});
