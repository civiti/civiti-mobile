import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ThemedBottomSheet,
  type BottomSheetMethods,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Localization } from '@/constants/localization';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReportReason } from '@/types/reports';

const REASONS: ReportReason[] = [
  'Spam',
  'Harassment',
  'Inappropriate',
  'Misinformation',
  'Other',
];

export type ReportTarget =
  | { type: 'issue'; id: string }
  | { type: 'comment'; id: string };

export type ReportSheetRef = {
  open: (target: ReportTarget) => void;
  close: () => void;
};

type ReportSheetProps = {
  onSubmit: (target: ReportTarget, reason: ReportReason, details: string | null) => void;
  isSubmitting?: boolean;
};

export const ReportSheet = forwardRef<ReportSheetRef, ReportSheetProps>(
  function ReportSheet({ onSubmit, isSubmitting }, ref) {
    const sheetRef = useRef<BottomSheetMethods>(null);
    const [target, setTarget] = useState<ReportTarget | null>(null);
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState('');

    const textColor = useThemeColor({}, 'text');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const accent = useThemeColor({}, 'accent');
    const border = useThemeColor({}, 'border');
    const surface = useThemeColor({}, 'surface');

    useImperativeHandle(ref, () => ({
      open: (t: ReportTarget) => {
        setTarget(t);
        setSelectedReason(null);
        setDetails('');
        sheetRef.current?.snapToIndex(0);
      },
      close: () => {
        sheetRef.current?.close();
      },
    }));

    const handleSubmit = useCallback(() => {
      if (!target || !selectedReason) return;
      onSubmit(target, selectedReason, details.trim() || null);
    }, [target, selectedReason, details, onSubmit]);

    return (
      <ThemedBottomSheet ref={sheetRef} snapPoints={['65%']}>
        <View style={styles.content}>
          <ThemedText type="h3">{Localization.report.title}</ThemedText>

          <ThemedText type="bodyBold">{Localization.report.reasonLabel}</ThemedText>
          {REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => setSelectedReason(reason)}
              style={styles.reasonRow}
              hitSlop={4}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedReason === reason }}
            >
              <IconSymbol
                name={selectedReason === reason ? 'checkmark.circle.fill' : 'circle'}
                size={20}
                color={selectedReason === reason ? accent : textSecondary}
              />
              <ThemedText type="body">
                {Localization.report.reasons[reason]}
              </ThemedText>
            </Pressable>
          ))}

          <TextInput
            style={[
              styles.detailsInput,
              { color: textColor, borderColor: border, backgroundColor: surface },
            ]}
            placeholder={Localization.report.detailsPlaceholder}
            placeholderTextColor={textSecondary}
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={500}
          />

          <Button
            variant="primary"
            title={Localization.report.submit}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      </ThemedBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.xs,
  },
  detailsInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    borderCurve: 'continuous',
    padding: Spacing.md,
    fontSize: 16,
    lineHeight: 24,
    height: 80,
    textAlignVertical: 'top',
  },
});
