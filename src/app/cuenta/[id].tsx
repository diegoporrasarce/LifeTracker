import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PortfolioChart } from '@/components/charts/portfolio-chart';
import { AccountForm } from '@/components/forms/account-form';
import { SnapshotForm } from '@/components/forms/snapshot-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { StackedBar } from '@/components/ui/stacked-bar';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { currentBalance, findAccount, portfolioSeries } from '@/store/selectors';
import { ACCOUNT_TYPE_LABELS, type AccountSnapshot } from '@/store/types';
import { monthLabel, monthLabelCapitalised } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

export default function AccountDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const { state, updateAccount, removeAccount, upsertSnapshot, removeSnapshot } = useApp();

  const account = findAccount(state.accounts, params.id);

  const [accountFormVisible, setAccountFormVisible] = useState(false);
  const [snapshotFormVisible, setSnapshotFormVisible] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<AccountSnapshot | null>(null);

  const series = useMemo(
    () => (account ? portfolioSeries([account]) : []),
    [account],
  );

  const balance = account ? currentBalance(account) : { cash: 0, invested: 0, total: 0 };

  const change = useMemo(() => {
    if (series.length < 2) return null;
    const previous = series[series.length - 2];
    const current = series[series.length - 1];
    if (!previous || !current) return null;
    const value = current.total - previous.total;
    return {
      value,
      percentage: previous.total === 0 ? 0 : (value / Math.abs(previous.total)) * 100,
    };
  }, [series]);

  const snapshots = useMemo(() => {
    if (!account) return [];
    return [...account.snapshots].sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [account]);

  if (!account) {
    return (
      <Screen variant="stack">
        <EmptyState
          icon="alert-circle-outline"
          title="Cuenta no encontrada"
          message="Puede que se haya eliminado desde otra pantalla."
        />
      </Screen>
    );
  }

  const openNewSnapshot = () => {
    setEditingSnapshot(null);
    setSnapshotFormVisible(true);
  };

  const openEditSnapshot = (snapshot: AccountSnapshot) => {
    setEditingSnapshot(snapshot);
    setSnapshotFormVisible(true);
  };

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ title: account.name }} />

      <View style={styles.headerBlock}>
        <Header
          title={account.name}
          subtitle={ACCOUNT_TYPE_LABELS[account.type]}
          right={
            <IconButton
              name="create-outline"
              accessibilityLabel="Editar cuenta"
              onPress={() => setAccountFormVisible(true)}
              color={theme.colors.textSecondary}
            />
          }
        />
      </View>

      <Card>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Saldo actual
        </Text>

        <Text style={[theme.typography.display, { color: theme.colors.text }]}>
          {formatCurrency(balance.total)}
        </Text>

        {balance.month ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            Registrado en {monthLabelCapitalised(balance.month)}
          </Text>
        ) : (
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            Todavía no hay balances
          </Text>
        )}

        {change ? (
          <View style={styles.changeRow}>
            <Ionicons
              name={change.value >= 0 ? 'trending-up' : 'trending-down'}
              size={15}
              color={change.value >= 0 ? theme.colors.success : theme.colors.danger}
            />
            <Text
              style={[
                theme.typography.caption,
                { color: change.value >= 0 ? theme.colors.success : theme.colors.danger },
              ]}>
              {formatCurrency(change.value, { showSign: true })} desde el mes anterior
            </Text>
          </View>
        ) : null}

        <View style={styles.breakdown}>
          <StackedBar
            segments={[
              {
                label: 'Efectivo',
                value: balance.cash,
                color: theme.colors.cash,
                valueLabel: formatCurrency(balance.cash, { decimals: 0 }),
              },
              {
                label: 'Invertido',
                value: balance.invested,
                color: theme.colors.invested,
                valueLabel: formatCurrency(balance.invested, { decimals: 0 }),
              },
            ]}
          />
        </View>
      </Card>

      <View style={styles.section}>
        <Card>
          <View style={styles.chartHeader}>
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Evolución de la cuenta
            </Text>
          </View>
          <PortfolioChart data={series} height={200} />
        </Card>
      </View>

      <View style={styles.section}>
        <Button
          label="Registrar balance de este mes"
          onPress={openNewSnapshot}
          icon={<Ionicons name="add-circle-outline" size={18} color={theme.colors.onPrimary} />}
          full
        />
      </View>

      <View style={styles.section}>
        <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
          Historial de balances
        </Text>

        {snapshots.length === 0 ? (
          <EmptyState
            icon="stats-chart-outline"
            title="Sin balances"
            message="Registra el saldo de cada mes para ver cómo evoluciona esta cuenta."
          />
        ) : (
          <View style={styles.list}>
            {snapshots.map((snapshot) => (
              <Card key={snapshot.id}>
                <View style={styles.snapshotRow}>
                  <View style={styles.snapshotText}>
                    <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>
                      {monthLabelCapitalised(snapshot.month)}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                      {formatCurrency(snapshot.cash, { decimals: 0 })} en cartera ·{' '}
                      {formatCurrency(snapshot.invested, { decimals: 0 })} invertido
                    </Text>
                    {snapshot.note ? (
                      <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
                        {snapshot.note}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
                    {formatCurrency(snapshot.cash + snapshot.invested)}
                  </Text>

                  <IconButton
                    name="chevron-forward"
                    accessibilityLabel={`Editar balance de ${monthLabel(snapshot.month)}`}
                    onPress={() => openEditSnapshot(snapshot)}
                    size={16}
                    color={theme.colors.textTertiary}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <AccountForm
        visible={accountFormVisible}
        account={account}
        onClose={() => setAccountFormVisible(false)}
        onSubmit={(input) => updateAccount(account.id, input)}
        onDelete={() => removeAccount(account.id)}
      />

      <SnapshotForm
        visible={snapshotFormVisible}
        snapshot={editingSnapshot}
        onClose={() => setSnapshotFormVisible(false)}
        onSubmit={(input) => upsertSnapshot(account.id, input)}
        onDelete={
          editingSnapshot ? () => removeSnapshot(account.id, editingSnapshot.id) : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 16,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
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
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  snapshotText: {
    flex: 1,
    gap: 2,
  },
});
