import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { FixedExpense } from '@/store/types';
import { formatCurrency } from '@/utils/format';

interface ExpenseItemProps {
  expense: FixedExpense;
  onPress?: () => void;
  /** Toggles the expense between active and paused. */
  onToggle?: () => void;
}

export function ExpenseItem({ expense, onPress, onToggle }: ExpenseItemProps) {
  const theme = useTheme();
  const muted = !expense.active;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expense.name}
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
            backgroundColor: muted ? theme.colors.surfaceAlt : theme.colors.primarySoft,
            borderRadius: theme.radius.md,
          },
        ]}>
        <Ionicons
          name="card-outline"
          size={18}
          color={muted ? theme.colors.textTertiary : theme.colors.primary}
        />
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.bodyStrong,
            { color: muted ? theme.colors.textSecondary : theme.colors.text },
          ]}>
          {expense.name}
        </Text>

        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {expense.category}
          {expense.dayOfMonth ? ` · día ${expense.dayOfMonth}` : ''}
          {muted ? ' · pausado' : ''}
        </Text>
      </View>

      <Text
        style={[
          theme.typography.subheading,
          { color: muted ? theme.colors.textTertiary : theme.colors.text },
        ]}>
        {formatCurrency(expense.amount)}
      </Text>

      {onToggle ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: expense.active }}
          accessibilityLabel={expense.active ? 'Pausar gasto' : 'Activar gasto'}
          onPress={onToggle}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons
            name={expense.active ? 'checkbox' : 'checkbox-outline'}
            size={22}
            color={expense.active ? theme.colors.primary : theme.colors.textTertiary}
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
});
