import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill },
        ]}>
        <Ionicons name={icon} size={26} color={theme.colors.textTertiary} />
      </View>
      <Text style={[theme.typography.subheading, { color: theme.colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {message ? (
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
          ]}>
          {message}
        </Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  action: {
    marginTop: 8,
  },
});
