import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  left?: ReactNode;
}

export function Header({ title, subtitle, right, left }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: theme.spacing.md }]}>
      <View style={styles.row}>
        {left ? <View style={styles.side}>{left}</View> : null}
        <View style={styles.textBlock}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.side}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  side: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
