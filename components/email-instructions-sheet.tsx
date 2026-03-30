import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import {
  ThemedBottomSheet,
  type BottomSheetMethods,
} from '@/components/ui/bottom-sheet';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

const SNAP_POINTS = ['55%'];

export type EmailInstructionsSheetRef = {
  open: (onContinue: () => void) => void;
  close: () => void;
};

export const EmailInstructionsSheet = forwardRef<EmailInstructionsSheetRef>(
  function EmailInstructionsSheet(_props, ref) {
    const sheetRef = useRef<BottomSheetMethods>(null);
    const onContinueRef = useRef<(() => void) | null>(null);
    const textSecondary = useThemeColor({}, 'textSecondary');

    useImperativeHandle(ref, () => ({
      open: (onContinue: () => void) => {
        onContinueRef.current = onContinue;
        sheetRef.current?.snapToIndex(0);
      },
      close: () => {
        sheetRef.current?.close();
      },
    }));

    const handleContinue = useCallback(() => {
      sheetRef.current?.close();
      onContinueRef.current?.();
    }, []);

    return (
      <ThemedBottomSheet ref={sheetRef} snapPoints={SNAP_POINTS}>
        <View style={styles.content}>
          <ThemedText type="h3">{Localization.email.instructionsTitle}</ThemedText>

          <ThemedText type="body">{Localization.email.instructionsBody}</ThemedText>

          <View style={styles.placeholders}>
            {Localization.email.instructionsPlaceholders.map((item) => (
              <ThemedText key={item} type="caption" style={{ color: textSecondary }}>
                {item}
              </ThemedText>
            ))}
          </View>

          <ThemedText type="caption" style={{ color: textSecondary }}>
            {Localization.email.instructionsNote}
          </ThemedText>

          <Button
            title={Localization.email.instructionsContinue}
            variant="primary"
            onPress={handleContinue}
            style={styles.button}
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
  placeholders: {
    gap: Spacing.xs,
  },
  button: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
