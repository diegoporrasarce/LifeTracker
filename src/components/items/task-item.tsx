import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { PRIORITY_LABELS, type Priority, type Task } from '@/store/types';
import { relativeDayLabel, todayISO } from '@/utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  /** Shows the trash button on the right side of the row. */
  onDelete?: () => void;
}

export function priorityColor(priority: Priority, theme: ReturnType<typeof useTheme>): string {
  if (priority === 'high') return theme.colors.danger;
  if (priority === 'medium') return theme.colors.primary;
  return theme.colors.textTertiary;
}

export function TaskItem({ task, onToggle, onPress, onDelete }: TaskItemProps) {
  const theme = useTheme();
  const overdue = !task.done && task.dueDate ? task.dueDate < todayISO() : false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.title}
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
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        hitSlop={10}
        onPress={onToggle}
        style={[
          styles.checkbox,
          {
            borderColor: task.done ? theme.colors.success : theme.colors.borderStrong,
            backgroundColor: task.done ? theme.colors.success : 'transparent',
          },
        ]}>
        {task.done ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
      </Pressable>

      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[
            theme.typography.body,
            {
              color: task.done ? theme.colors.textTertiary : theme.colors.text,
              textDecorationLine: task.done ? 'line-through' : 'none',
            },
          ]}>
          {task.title}
        </Text>

        {task.notes ? (
          <Text
            numberOfLines={1}
            style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {task.notes}
          </Text>
        ) : null}

        <View style={styles.meta}>
          {task.dueDate ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={overdue ? theme.colors.danger : theme.colors.textSecondary}
              />
              <Text
                style={[
                  theme.typography.micro,
                  { color: overdue ? theme.colors.danger : theme.colors.textSecondary },
                ]}>
                {relativeDayLabel(task.dueDate)}
              </Text>
            </View>
          ) : null}

          {task.priority !== 'low' ? (
            <View style={styles.metaItem}>
              <View
                style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority, theme) }]}
              />
              <Text style={[theme.typography.micro, { color: theme.colors.textSecondary }]}>
                {PRIORITY_LABELS[task.priority]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${task.title}`}
          hitSlop={8}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.sm,
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <Ionicons name="trash-outline" size={17} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  deleteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
});
