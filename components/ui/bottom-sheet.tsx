import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { BorderRadius } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

export type BottomSheetMethods = GorhomBottomSheet;

type ThemedBottomSheetProps = PropsWithChildren<{
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
  enablePanDownToClose?: boolean;
  backdropPressBehavior?: 'close' | 'none' | 'collapse';
}>;

export const ThemedBottomSheet = forwardRef<GorhomBottomSheet, ThemedBottomSheetProps>(
  function ThemedBottomSheet({ snapPoints = ['75%'], onChange, enablePanDownToClose = true, backdropPressBehavior = 'close', children }, ref) {
    const surfaceColor = useThemeColor({}, 'surface');
    const borderColor = useThemeColor({}, 'border');

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} pressBehavior={backdropPressBehavior} />
      ),
      [backdropPressBehavior],
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        onChange={onChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.background, { backgroundColor: surfaceColor }]}
        handleIndicatorStyle={[styles.handle, { backgroundColor: borderColor }]}
      >
        {children}
      </GorhomBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  handle: {
    width: 40,
  },
});
