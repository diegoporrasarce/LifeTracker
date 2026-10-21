import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PortfolioChart } from '@/components/charts/portfolio-chart';
import { AccountForm } from '@/components/forms/account-form';
import { AccountItem } from '@/components/items/account-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { StackedBar } from '@/components/ui/stacked-bar';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { monthlyChange, portfolioSeries, portfolioTotals } from '@/store/selectors';
import type { Account } from '@/store/types';
import { addMonths, currentMonthKey } from '@/utils/date';
import { formatCurrency, formatPercent } from '@/utils/format';

type Range = '6m' | '12m' | 'all';

const RANGE_OPTIONS = [
  { value: '6m' as const, label: '6 M' },
  { value: '12m' as const, label: '12 M' },
  { value: 'all' as const, label: 'Todo' },
];

export default function PortfolioScreen() {
  const theme = useTheme();
  const { state, addAccount, updateAccount, removeAccount } = useApp();

  const [range, setRange] = useState<Range>('12m');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const totals = useMemo(() => portfolioTotals(state.accounts), [state.accounts]);

  const series = useMemo(() => {
    const current = currentMonthKey();
    if (range === '6m') return portfolioSeries(state.accounts, { from: addMonths(current, -5) });
    if (range === '12m') return portfolioSeries(state.accounts, { from: addMonths(current, -11) });
    return portfolioSeries(state.accounts);
  }, [state.accounts, range]);

  const change = monthlyChange(series);
  const positive = (change?.value ?? 0) >= 0;

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (account: Account) => {
    setEditing(account);
    setFormVisible(true);
  };

  return (
    <Screen
      header={
        <Header
          title="Cartera"
          subtitle="Tu dinero repartido entre bancos y brókeres"
          right={
            <IconButton
              name="add"
              accessibilityLabel="Nueva cuenta"
              onPress={openNew}
              filled
              color={theme.colors.primary}
            />
          }
        />
      }>
      <Card>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Total de cartera
        </Text>

        <Text style={[theme.typography.display, { color: theme.colors.text }]}>
          {formatCurrency(totals.total)}
        </Text>

        {change ? (
          <View style={styles.changeRow}>
            <View
              style={[
                styles.changeChip,
                {
                  backgroundColor: positive ? theme.colors.successSoft : theme.colors.dangerSoft,
                },
              ]}>
              <Ionicons
                name={positive ? 'trending-up' : 'trending-down'}
                size={13}
                color={positive ? theme.colors.success : theme.colors.danger}
              />
              <Text
                style={[
                  theme.typography.caption,
                  { color: positive ? theme.colors.success : theme.colors.danger },
                ]}>
                {formatCurrency(change.value, { showSign: true })} ·{' '}
                {formatPercent(change.percentage)}
              </Text>
            </View>
            <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
              desde el mes anterior
            </Text>
          </View>
        ) : null}

        <View style={styles.breakdown}>
          <StackedBar
            segments={[
              {
                label: 'Efectivo',
                value: totals.cash,
                color: theme.colors.cash,
                valueLabel: formatCurrency(totals.cash, { decimals: 0 }),
              },
              {
                label: 'Invertido',
                value: totals.invested,
                color: theme.colors.invested,
                valueLabel: formatCurrency(totals.invested, { decimals: 0 }),
              },
            ]}
          />
        </View>
      </Card>

      <View style={styles.section}>
        <Card>
          <View style={styles.chartHeader}>
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Evolución mensual
            </Text>
            <View style={styles.rangePicker}>
              <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} />
            </View>
          </View>
          <PortfolioChart data={series} />
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
            Cuentas
          </Text>
          <PressableAdd onPress={openNew} />
        </View>

        {state.accounts.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="Sin cuentas"
            message="Añade un banco o bróker para empezar a medir tu cartera."
            action={
              <Button
                label="Añadir cuenta"
                onPress={openNew}
                icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {state.accounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                onPress={() => router.push(`/cuenta/${account.id}`)}
              />
            ))}
          </View>
        )}
      </View>

      <AccountForm
        visible={formVisible}
        account={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => {
          if (editing) {
            updateAccount(editing.id, input);
          } else {
            addAccount(input);
          }
        }}
        onDelete={editing ? () => removeAccount(editing.id) : undefined}
      />
    </Screen>
  );
}

function PressableAdd({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <IconButton
      name="add-circle-outline"
      accessibilityLabel="Nueva cuenta"
      onPress={onPress}
      color={theme.colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  breakdown: {
    marginTop: 18,
  },
  section: {
    marginTop: 16,
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  rangePicker: {
    width: 160,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: 10,
  },
});
