import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md },
      ]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: active ? theme.colors.surface : 'transparent',
                borderRadius: theme.radius.sm,
                opacity: pressed && !active ? 0.6 : 1,
              },
            ]}>
            <Text
              numberOfLines={1}
              style={[
                theme.typography.caption,
                { color: active ? theme.colors.text : theme.colors.textSecondary },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
});
