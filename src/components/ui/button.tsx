import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: object;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  full = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const background =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.dangerSoft
        : variant === 'secondary'
          ? theme.colors.surfaceAlt
          : 'transparent';

  const foreground =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'danger'
        ? theme.colors.danger
        : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.sm + 2,
          paddingHorizontal: theme.spacing.md,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        full && styles.full,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[theme.typography.bodyStrong, { color: foreground }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  full: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
