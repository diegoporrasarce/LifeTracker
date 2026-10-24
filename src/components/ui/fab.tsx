import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface FabProps {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: IconName;
}

/**
 * Floating action button, pinned to the bottom-right corner of a screen.
 *
 * Render it through the `overlay` prop of `Screen` so it floats above the
 * scrollable content without taking part in the layout.
 */
export function Fab({ onPress, accessibilityLabel, icon = 'add' }: FabProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.xl,
          shadowColor: theme.colors.shadow,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Ionicons name={icon} size={30} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
});
