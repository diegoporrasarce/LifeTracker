import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface ChipProps {
  label: string;
  color?: string;
  background?: string;
  icon?: ReactNode;
  small?: boolean;
}

export function Chip({ label, color, background, icon, small = false }: ChipProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.textSecondary;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: background ?? theme.colors.surfaceAlt,
          borderRadius: theme.radius.pill,
          paddingVertical: small ? 2 : 4,
          paddingHorizontal: small ? 7 : 9,
        },
      ]}>
      {icon}
      <Text
        numberOfLines={1}
        style={[
          small ? theme.typography.micro : theme.typography.caption,
          { color: tint },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
});
