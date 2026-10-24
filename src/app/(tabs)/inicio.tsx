import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { debtSummary } from '@/store/selectors';
import type { Task } from '@/store/types';
import { formatDateFull, relativeDayLabel, todayISO } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

function greetingFor(hour: number): string {
  if (hour < 13) return 'Buenos días';
  if (hour < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const theme = useTheme();
  const { state, toggleTask } = useApp();

  const today = todayISO();

  const debts = useMemo(() => debtSummary(state.debts), [state.debts]);

  const pending = useMemo(() => state.tasks.filter((task) => !task.done), [state.tasks]);
  const todayTasks = useMemo(
    () => pending.filter((task) => task.dueDate === today),
    [pending, today],
  );
  const overdueCount = useMemo(
    () => pending.filter((task) => task.dueDate && task.dueDate < today).length,
    [pending, today],
  );

  const name = state.settings.userName.trim();

  return (
    <Screen
      header={
        <Header
          title={name ? `Bienvenido, ${name}` : 'Bienvenido'}
          subtitle={`${greetingFor(new Date().getHours())} · ${formatDateFull(today)}`}
        />
      }>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver la cartera"
        onPress={() => router.navigate('/cartera')}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Tu cartera
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </View>

          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4 }]}>
            Ver resumen y cuentas
          </Text>
        </Card>
      </Pressable>

      <View style={styles.stats}>
        <Card>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Tareas hoy
              </Text>
              <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
                {todayTasks.length}
              </Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Pendientes
              </Text>
              <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
                {pending.length}
              </Text>
              {overdueCount > 0 ? (
                <Text style={[theme.typography.micro, { color: theme.colors.danger }]}>
                  {overdueCount} vencida{overdueCount === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>

            <View style={styles.statBlock}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Deudas
              </Text>
              <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
                {debts.openCount}
              </Text>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
                {formatCurrency(debts.receivableMoney - debts.payableMoney, { showSign: true })}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
            Para hoy
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/')}
            hitSlop={8}>
            <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>
              Ver todas
            </Text>
          </Pressable>
        </View>

        {todayTasks.length === 0 ? (
          <EmptyState
            icon="sunny-outline"
            title="Nada para hoy"
            message="No tienes tareas con fecha para hoy. Disfruta del día."
          />
        ) : (
          <View style={styles.list}>
            {todayTasks.map((task) => (
              <TodayTaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function TodayTaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.taskRow,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
        },
      ]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.title}
        hitSlop={10}
        onPress={onToggle}
        style={[
          styles.checkbox,
          {
            borderColor: theme.colors.borderStrong,
            borderRadius: 11,
          },
        ]}
      />

      <View style={styles.taskBody}>
        <Text
          numberOfLines={1}
          style={[theme.typography.body, { color: theme.colors.text }]}>
          {task.title}
        </Text>
        {task.dueDate ? (
          <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
            {relativeDayLabel(task.dueDate)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: {
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBlock: {
    flex: 1,
    gap: 2,
  },
  section: {
    marginTop: 20,
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
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBody: {
    flex: 1,
    gap: 2,
  },
});
