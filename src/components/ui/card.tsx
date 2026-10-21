import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Remove the inner padding, useful when the card holds a full bleed chart. */
  flush?: boolean;
}

export function Card({ children, style, flush = false }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          padding: flush ? 0 : theme.spacing.md,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#0A1020',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
