import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Debt } from '@/store/types';
import { formatDateLong } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

interface DebtItemProps {
  debt: Debt;
  onPress?: () => void;
  /** Marks the debt as settled or reopens it. */
  onToggle?: () => void;
}

export function DebtItem({ debt, onPress, onToggle }: DebtItemProps) {
  const theme = useTheme();
  const receivable = debt.direction === 'they_owe_me';
  const settled = debt.settled;

  const accent = settled
    ? theme.colors.textTertiary
    : receivable
      ? theme.colors.success
      : theme.colors.danger;

  const icon = debt.kind === 'money' ? 'cash-outline' : 'gift-outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={debt.title}
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
      <View
        style={[
          styles.icon,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
          },
        ]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.bodyStrong,
            { color: settled ? theme.colors.textSecondary : theme.colors.text, textDecorationLine: settled ? 'line-through' : 'none' },
          ]}>
          {debt.title}
        </Text>

        <Text numberOfLines={1} style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {[
            receivable ? 'Me deben' : 'Yo debo',
            debt.person,
            debt.dueDate ? formatDateLong(debt.dueDate) : undefined,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>

      <View style={styles.amountBlock}>
        {debt.kind === 'money' ? (
          <Text style={[theme.typography.subheading, { color: settled ? theme.colors.textTertiary : theme.colors.text }]}>
            {formatCurrency(debt.amount ?? 0)}
          </Text>
        ) : (
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>Sin cantidad</Text>
        )}
        {settled ? (
          <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Saldada</Text>
        ) : null}
      </View>

      {onToggle ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: settled }}
          accessibilityLabel={settled ? 'Reabrir deuda' : 'Marcar como saldada'}
          onPress={onToggle}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons
            name={settled ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={settled ? theme.colors.success : theme.colors.textTertiary}
          />
        </Pressable>
      ) : null}
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
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
});
