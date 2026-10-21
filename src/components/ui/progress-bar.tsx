import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  /** Ratio between 0 and 1. */
  value: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: theme.colors.surfaceAlt },
      ]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color ?? theme.colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
