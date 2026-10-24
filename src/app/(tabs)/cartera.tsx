import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { debtSummary, monthlyChange, portfolioSeries, portfolioTotals } from '@/store/selectors';
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
  const { state, addAccount } = useApp();

  const [range, setRange] = useState<Range>('12m');
  const [formVisible, setFormVisible] = useState(false);

  const totals = useMemo(() => portfolioTotals(state.accounts), [state.accounts]);
  const debts = useMemo(() => debtSummary(state.debts), [state.debts]);
  const netDebt = debts.receivableMoney - debts.payableMoney;

  const series = useMemo(() => {
    const current = currentMonthKey();
    if (range === '6m') return portfolioSeries(state.accounts, { from: addMonths(current, -5) });
    if (range === '12m') return portfolioSeries(state.accounts, { from: addMonths(current, -11) });
    return portfolioSeries(state.accounts);
  }, [state.accounts, range]);

  const change = monthlyChange(series);
  const positive = (change?.value ?? 0) >= 0;

  const openNew = () => {
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
      </Card>

      <View style={styles.section}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/deudas')}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
          <Card>
            <View style={styles.debtsRow}>
              <View style={styles.debtsText}>
                <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
                  Deudas
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Me deben {formatCurrency(debts.receivableMoney)} · Yo debo{' '}
                  {formatCurrency(debts.payableMoney)}
                </Text>
              </View>
              <View style={styles.debtsRight}>
                <Text
                  style={[
                    theme.typography.bodyStrong,
                    { color: netDebt >= 0 ? theme.colors.success : theme.colors.danger },
                  ]}>
                  {formatCurrency(netDebt, { showSign: true })}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </View>
            </View>
          </Card>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Card>
          <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
            Evolución mensual
          </Text>
          <View style={styles.rangePicker}>
            <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} />
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
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => addAccount(input)}
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
  section: {
    marginTop: 16,
    gap: 12,
  },
  rangePicker: {
    marginTop: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: 10,
  },
  debtsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debtsText: {
    flex: 1,
    gap: 2,
  },
  debtsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
