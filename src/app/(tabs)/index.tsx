import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { TaskForm } from '@/components/forms/task-form';
import { TaskItem } from '@/components/items/task-item';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Fab } from '@/components/ui/fab';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import type { Task } from '@/store/types';
import { daysFromToday, todayISO } from '@/utils/date';

type Filter = 'pending' | 'today' | 'all' | 'done';

const FILTERS = [
  { value: 'pending' as const, label: 'Pendientes' },
  { value: 'today' as const, label: 'Hoy' },
  { value: 'all' as const, label: 'Todas' },
  { value: 'done' as const, label: 'Hechas' },
];

interface Group {
  title: string;
  data: Task[];
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.priority !== b.priority) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

function groupTasks(tasks: Task[], filter: Filter): Group[] {
  const today = todayISO();

  const filtered = tasks.filter((task) => {
    if (filter === 'pending') return !task.done;
    if (filter === 'today') return !task.done && task.dueDate === today;
    if (filter === 'done') return task.done;
    return true;
  });

  if (filter === 'done') {
    const done = sortTasks(filtered);
    return done.length ? [{ title: 'Completadas', data: done }] : [];
  }

  const groups: Group[] = [
    { title: 'Vencidas', data: [] },
    { title: 'Hoy', data: [] },
    { title: 'Mañana', data: [] },
    { title: 'Esta semana', data: [] },
    { title: 'Más adelante', data: [] },
    { title: 'Sin fecha', data: [] },
  ];

  for (const task of filtered) {
    if (!task.dueDate) {
      groups[5].data.push(task);
      continue;
    }
    const diff = daysFromToday(task.dueDate);
    if (diff < 0) groups[0].data.push(task);
    else if (diff === 0) groups[1].data.push(task);
    else if (diff === 1) groups[2].data.push(task);
    else if (diff <= 7) groups[3].data.push(task);
    else groups[4].data.push(task);
  }

  return groups
    .map((group) => ({ title: group.title, data: sortTasks(group.data) }))
    .filter((group) => group.data.length > 0);
}

export default function TasksScreen() {
  const theme = useTheme();
  const { state, addTask, updateTask, toggleTask, removeTask } = useApp();
  const [filter, setFilter] = useState<Filter>('pending');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const groups = useMemo(
    () => groupTasks(state.tasks, filter),
    [state.tasks, filter],
  );

  const pendingCount = state.tasks.filter((task) => !task.done).length;
  const todayCount = state.tasks.filter((task) => !task.done && task.dueDate === todayISO()).length;

  const handleToggle = (task: Task) => {
    void Haptics.selectionAsync();
    toggleTask(task.id);
  };

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormVisible(true);
  };

  const handleDelete = (task: Task) => {
    const confirmDelete = () => {
      void Haptics.impactAsync();
      removeTask(task.id);
    };

    // `Alert` is a no-op on web, so there the task is deleted straight away.
    if (Platform.OS === 'web') {
      confirmDelete();
      return;
    }

    Alert.alert('Eliminar tarea', `¿Quieres eliminar "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: confirmDelete },
    ]);
  };

  return (
    <Screen
      bottomSpacing={104}
      overlay={<Fab onPress={openNew} accessibilityLabel="Nueva tarea" />}
      header={
        <Header
          title="Tareas"
          subtitle={
            todayCount > 0
              ? `${todayCount} para hoy · ${pendingCount} pendientes`
              : `${pendingCount} pendientes`
          }
          right={
            <View style={styles.actions}>
              <IconButton
                name="settings-outline"
                accessibilityLabel="Ajustes"
                onPress={() => router.push('/ajustes')}
                color={theme.colors.textSecondary}
              />
              <IconButton
                name="add"
                accessibilityLabel="Nueva tarea"
                onPress={openNew}
                filled
                color={theme.colors.primary}
              />
            </View>
          }
        />
      }>
      <Segmented options={FILTERS} value={filter} onChange={setFilter} />

      <View style={styles.list}>
        {groups.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title={filter === 'done' ? 'Nada completado todavía' : 'Todo al día'}
            message={
              filter === 'done'
                ? 'Las tareas que marques como hechas aparecerán aquí.'
                : 'No tienes tareas pendientes. Añade una para empezar.'
            }
            action={
              <Button
                label="Nueva tarea"
                onPress={openNew}
                icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
              />
            }
          />
        ) : (
          groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {group.title} · {group.data.length}
              </Text>
              {group.data.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggle(task)}
                  onPress={() => openEdit(task)}
                  onDelete={() => handleDelete(task)}
                />
              ))}
            </View>
          ))
        )}
      </View>

      <TaskForm
        visible={formVisible}
        task={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => {
          if (editing) {
            updateTask(editing.id, input);
          } else {
            addTask(input);
          }
        }}
        onDelete={editing ? () => removeTask(editing.id) : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  list: {
    marginTop: 16,
    gap: 20,
  },
  group: {
    gap: 8,
  },
});
