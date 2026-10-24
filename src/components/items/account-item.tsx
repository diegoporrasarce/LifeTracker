import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ACCOUNT_TYPE_LABELS, type Account } from '@/store/types';
import { currentBalance } from '@/store/selectors';
import { monthLabelCapitalised } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

interface AccountItemProps {
  account: Account;
  onPress?: () => void;
}

export function AccountItem({ account, onPress }: AccountItemProps) {
  const theme = useTheme();
  const balance = currentBalance(account);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={account.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <View style={[styles.accent, { backgroundColor: account.color }]} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>
            {account.name}
          </Text>
          <View style={styles.typeBadge}>
            <Ionicons
              name={account.type === 'bank' ? 'business-outline' : 'trending-up-outline'}
              size={11}
              color={theme.colors.textSecondary}
            />
            <Text style={[theme.typography.micro, { color: theme.colors.textSecondary }]}>
              {ACCOUNT_TYPE_LABELS[account.type]}
            </Text>
          </View>
        </View>

        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
          {formatCurrency(balance.total)}
        </Text>

        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {balance.month
            ? `Registrado en ${monthLabelCapitalised(balance.month)}`
            : 'Sin balances registrados'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginVertical: 2,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
