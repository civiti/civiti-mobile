import { StyleSheet, View, type ViewProps } from 'react-native';

import { BorderRadius } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

type ProgressBarProps = ViewProps & {
  progress: number;
  fillColor?: string;
};

export function ProgressBar({ progress, fillColor, style, ...rest }: ProgressBarProps) {
  const trackColor = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const fill = fillColor ?? accent;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clampedProgress * 100),
      }}
      {...rest}
    >
      <View
        style={[
          styles.fill,
          { width: `${clampedProgress * 100}%`, backgroundColor: fill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.xs,
  },
});
