import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DebtForm } from '@/components/forms/debt-form';
import { DebtItem } from '@/components/items/debt-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { debtSummary } from '@/store/selectors';
import type { Debt } from '@/store/types';
import { formatCurrency } from '@/utils/format';

type Filter = 'open' | 'they_owe_me' | 'i_owe' | 'settled';

const FILTERS = [
  { value: 'open' as const, label: 'Pendientes' },
  { value: 'they_owe_me' as const, label: 'Me deben' },
  { value: 'i_owe' as const, label: 'Yo debo' },
  { value: 'settled' as const, label: 'Saldadas' },
];

export default function DebtsScreen() {
  const theme = useTheme();
  const { state, addDebt, updateDebt, removeDebt } = useApp();

  const [filter, setFilter] = useState<Filter>('open');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);

  const summary = useMemo(() => debtSummary(state.debts), [state.debts]);
  const net = summary.receivableMoney - summary.payableMoney;

  const visible = useMemo(() => {
    const list = state.debts.filter((debt) => {
      if (filter === 'open') return !debt.settled;
      if (filter === 'settled') return debt.settled;
      return debt.direction === filter && !debt.settled;
    });

    return [...list].sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
        return a.dueDate < b.dueDate ? -1 : 1;
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [state.debts, filter]);

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (debt: Debt) => {
    setEditing(debt);
    setFormVisible(true);
  };

  const handleToggle = (debt: Debt) => {
    void Haptics.selectionAsync();
    updateDebt(debt.id, { settled: !debt.settled });
  };

  return (
    <Screen
      header={
        <Header
          title="Deudas"
          subtitle="Dinero u objetos pendientes"
          right={
            <IconButton
              name="add"
              accessibilityLabel="Nueva deuda"
              onPress={openNew}
              filled
              color={theme.colors.primary}
            />
          }
        />
      }>
      <Card>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryLabel}>
              <Ionicons name="arrow-down-circle" size={15} color={theme.colors.success} />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Me deben
              </Text>
            </View>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
              {formatCurrency(summary.receivableMoney)}
            </Text>
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
              {summary.receivableCount} pendiente{summary.receivableCount === 1 ? '' : 's'}
              {summary.receivableOther > 0
                ? ` · ${summary.receivableOther} sin cantidad`
                : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryBlock}>
            <View style={styles.summaryLabel}>
              <Ionicons name="arrow-up-circle" size={15} color={theme.colors.danger} />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Yo debo
              </Text>
            </View>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
              {formatCurrency(summary.payableMoney)}
            </Text>
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
              {summary.payableCount} pendiente{summary.payableCount === 1 ? '' : 's'}
              {summary.payableOther > 0 ? ` · ${summary.payableOther} sin cantidad` : ''}
            </Text>
          </View>
        </View>

        {summary.receivableMoney > 0 || summary.payableMoney > 0 ? (
          <View
            style={[
              styles.net,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
              },
            ]}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Balance neto
            </Text>
            <Text
              style={[
                theme.typography.subheading,
                { color: net >= 0 ? theme.colors.success : theme.colors.danger },
              ]}>
              {formatCurrency(net, { showSign: true })}
            </Text>
          </View>
        ) : null}
      </Card>

      <View style={styles.section}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />

        {visible.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title={filter === 'settled' ? 'Nada saldado todavía' : 'Sin deudas'}
            message={
              filter === 'settled'
                ? 'Las deudas que marques como saldadas aparecerán aquí.'
                : 'Apunta lo que te deben y lo que debes tú, incluso cosas que no son dinero.'
            }
            action={
              <Button
                label="Añadir deuda"
                onPress={openNew}
                icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {visible.map((debt) => (
              <DebtItem
                key={debt.id}
                debt={debt}
                onPress={() => openEdit(debt)}
                onToggle={() => handleToggle(debt)}
              />
            ))}
          </View>
        )}
      </View>

      <DebtForm
        visible={formVisible}
        debt={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => {
          if (editing) {
            updateDebt(editing.id, input);
          } else {
            addDebt(input);
          }
        }}
        onDelete={editing ? () => removeDebt(editing.id) : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryBlock: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#8D97A4',
    opacity: 0.4,
  },
  net: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  section: {
    marginTop: 16,
    gap: 16,
  },
  list: {
    gap: 10,
  },
});
