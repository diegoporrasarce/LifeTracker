import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExpenseForm } from '@/components/forms/expense-form';
import { ExpenseItem } from '@/components/items/expense-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { StackedBar } from '@/components/ui/stacked-bar';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { expenseSummary } from '@/store/selectors';
import type { FixedExpense } from '@/store/types';
import { formatCurrency } from '@/utils/format';

const CATEGORY_COLORS = [
  '#2F6BFF',
  '#7A5AF8',
  '#0E9E8D',
  '#E8590C',
  '#D6336C',
  '#0B7285',
  '#F08C00',
  '#5C6673',
];

export default function ExpensesScreen() {
  const theme = useTheme();
  const { state, addExpense, updateExpense, removeExpense } = useApp();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);

  const summary = useMemo(() => expenseSummary(state.expenses), [state.expenses]);
  const income = state.settings.monthlyIncome;
  const balance = income - summary.monthly;
  const hasIncome = income > 0;

  const sorted = useMemo(() => {
    return [...state.expenses].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      const dayA = a.dayOfMonth ?? 32;
      const dayB = b.dayOfMonth ?? 32;
      if (dayA !== dayB) return dayA - dayB;
      return a.name.localeCompare(b.name, 'es');
    });
  }, [state.expenses]);

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (expense: FixedExpense) => {
    setEditing(expense);
    setFormVisible(true);
  };

  return (
    <Screen
      header={
        <Header
          title="Gastos"
          subtitle="Lo que se repite cada mes"
          right={
            <IconButton
              name="add"
              accessibilityLabel="Nuevo gasto"
              onPress={openNew}
              filled
              color={theme.colors.primary}
            />
          }
        />
      }>
      <Card>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Gastos fijos al mes
        </Text>

        <Text style={[theme.typography.display, { color: theme.colors.text }]}>
          {formatCurrency(summary.monthly)}
        </Text>

        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
          {formatCurrency(summary.annual)} al año · {summary.byCategory.length}{' '}
          {summary.byCategory.length === 1 ? 'categoría' : 'categorías'}
        </Text>

        {summary.byCategory.length > 0 ? (
          <View style={styles.breakdown}>
            <StackedBar
              segments={summary.byCategory.map((entry, index) => ({
                label: entry.category,
                value: entry.amount,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                valueLabel: formatCurrency(entry.amount, { decimals: 0 }),
              }))}
            />
          </View>
        ) : null}
      </Card>

      {hasIncome ? (
        <View style={styles.section}>
          <Card>
            <View style={styles.incomeRow}>
              <View style={styles.incomeBlock}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Ingresos estimados
                </Text>
                <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
                  {formatCurrency(income)}
                </Text>
              </View>
              <View style={styles.incomeBlock}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Te queda
                </Text>
                <Text
                  style={[
                    theme.typography.subheading,
                    { color: balance >= 0 ? theme.colors.success : theme.colors.danger },
                  ]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>

            <View style={styles.progress}>
              <ProgressBar
                value={income > 0 ? summary.monthly / income : 0}
                color={balance >= 0 ? theme.colors.success : theme.colors.danger}
              />
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
                Los gastos consumen el {Math.round((summary.monthly / income) * 100)} % de tus ingresos.
              </Text>
            </View>
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
            Gastos registrados
          </Text>
          <IconButton
            name="add-circle-outline"
            accessibilityLabel="Nuevo gasto"
            onPress={openNew}
            color={theme.colors.primary}
          />
        </View>

        {sorted.length === 0 ? (
          <EmptyState
            icon="card-outline"
            title="Sin gastos fijos"
            message="Añade alquiler, suministros o suscripciones para ver el total de cada mes."
            action={
              <Button
                label="Añadir gasto"
                onPress={openNew}
                icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {sorted.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onPress={() => openEdit(expense)}
                onToggle={() =>
                  updateExpense(expense.id, { active: !expense.active })
                }
              />
            ))}
          </View>
        )}
      </View>

      <ExpenseForm
        visible={formVisible}
        expense={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => {
          if (editing) {
            updateExpense(editing.id, input);
          } else {
            addExpense(input);
          }
        }}
        onDelete={editing ? () => removeExpense(editing.id) : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  breakdown: {
    marginTop: 18,
  },
  section: {
    marginTop: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: 10,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  incomeBlock: {
    flex: 1,
    gap: 2,
  },
  progress: {
    marginTop: 14,
    gap: 8,
  },
});
