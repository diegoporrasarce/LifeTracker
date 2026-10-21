import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  /** Draw a filled circle behind the icon. */
  filled?: boolean;
  accessibilityLabel: string;
}

export function IconButton({
  name,
  onPress,
  size = 20,
  color,
  filled = false,
  accessibilityLabel,
}: IconButtonProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size + 18,
          height: size + 18,
          borderRadius: (size + 18) / 2,
          backgroundColor: filled ? theme.colors.surfaceAlt : 'transparent',
          opacity: pressed ? 0.6 : 1,
        },
      ]}>
      <Ionicons name={name} size={size} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
