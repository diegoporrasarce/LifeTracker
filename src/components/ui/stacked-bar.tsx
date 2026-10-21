import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
  /** Text shown on the right of the label, usually a formatted amount. */
  valueLabel?: string;
}

interface StackedBarProps {
  segments: StackedSegment[];
  height?: number;
  hideLabels?: boolean;
}

/** Horizontal bar splitting a total into proportional segments. */
export function StackedBar({ segments, height = 10, hideLabels = false }: StackedBarProps) {
  const theme = useTheme();
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          { height, borderRadius: height / 2, backgroundColor: theme.colors.surfaceAlt },
        ]}>
        {total > 0
          ? segments.map((segment) => {
              const ratio = Math.max(0, segment.value) / total;
              if (ratio <= 0) return null;
              return (
                <View key={segment.label} style={{ flex: ratio, backgroundColor: segment.color }} />
              );
            })
          : null}
      </View>
      {hideLabels ? null : (
        <View style={styles.labels}>
          {segments.map((segment) => (
            <View key={segment.label} style={styles.labelItem}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text
                numberOfLines={1}
                style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {segment.label}
              </Text>
              {segment.valueLabel ? (
                <Text
                  numberOfLines={1}
                  style={[theme.typography.caption, { color: theme.colors.text }]}>
                  {segment.valueLabel}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  track: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
