import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthGrid, type DayMark } from '@/components/calendar/month-grid';
import { EventForm } from '@/components/forms/event-form';
import { EventItem } from '@/components/items/event-item';
import { TaskItem } from '@/components/items/task-item';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import type { CalendarEvent } from '@/store/types';
import {
  addMonths,
  currentMonthKey,
  formatDateFull,
  isSameMonth,
  monthLabelCapitalised,
  todayISO,
} from '@/utils/date';

export default function CalendarScreen() {
  const theme = useTheme();
  const { state, addEvent, updateEvent, removeEvent, toggleTask } = useApp();

  const [month, setMonth] = useState(currentMonthKey());
  const [selected, setSelected] = useState(todayISO());
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const getMarks = useMemo(() => {
    return (date: string): DayMark[] => {
      const marks: DayMark[] = [];

      for (const event of state.events) {
        if (event.date !== date) continue;
        marks.push({
          key: `event-${event.id}`,
          color: event.kind === 'done' ? theme.colors.success : theme.colors.primary,
        });
      }

      for (const task of state.tasks) {
        if (task.dueDate !== date || task.done) continue;
        marks.push({
          key: `task-${task.id}`,
          color:
            task.priority === 'high'
              ? theme.colors.danger
              : task.priority === 'medium'
                ? theme.colors.warning
                : theme.colors.textTertiary,
        });
      }

      return marks;
    };
  }, [state.events, state.tasks, theme.colors]);

  const dayEvents = useMemo(
    () => state.events.filter((event) => event.date === selected),
    [state.events, selected],
  );

  const dayTasks = useMemo(
    () => state.tasks.filter((task) => task.dueDate === selected && !task.done),
    [state.tasks, selected],
  );

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (event: (typeof state.events)[number]) => {
    setEditing(event);
    setFormVisible(true);
  };

  const goToToday = () => {
    setMonth(currentMonthKey());
    setSelected(todayISO());
  };

  const selectedIsToday = selected === todayISO();

  return (
    <Screen
      header={
        <Header
          title="Calendario"
          subtitle={monthLabelCapitalised(month)}
          right={
            <IconButton
              name="add"
              accessibilityLabel="Nuevo evento"
              onPress={openNew}
              filled
              color={theme.colors.primary}
            />
          }
        />
      }>
      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <IconButton
            name="chevron-back"
            accessibilityLabel="Mes anterior"
            onPress={() => setMonth((current) => addMonths(current, -1))}
          />
          <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
            {monthLabelCapitalised(month)}
          </Text>
          <IconButton
            name="chevron-forward"
            accessibilityLabel="Mes siguiente"
            onPress={() => setMonth((current) => addMonths(current, 1))}
          />
        </View>

        <MonthGrid month={month} selected={selected} onSelect={setSelected} getMarks={getMarks} />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
              Hecho
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
              Me toca
            </Text>
          </View>
          <Pressable onPress={goToToday} hitSlop={8}>
            <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>Hoy</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.dayHeader}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
          {selectedIsToday ? 'Hoy' : formatDateFull(selected)}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {dayEvents.length === 0 && dayTasks.length === 0
            ? 'Nada planificado'
            : `${dayEvents.length} evento${dayEvents.length === 1 ? '' : 's'}${
                dayTasks.length ? ` · ${dayTasks.length} tarea${dayTasks.length === 1 ? '' : 's'}` : ''
              }`}
        </Text>
      </View>

      {dayEvents.length === 0 && dayTasks.length === 0 ? (
        <EmptyState
          icon="calendar-clear-outline"
          title="Día libre"
          message="Apunta lo que hagas o lo que te toque en este día."
          action={
            <Button
              label="Añadir evento"
              onPress={openNew}
              icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
            />
          }
        />
      ) : (
        <View style={styles.list}>
          {dayEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onPress={() => openEdit(event)}
              onToggle={() => {
                void Haptics.selectionAsync();
                updateEvent(event.id, { kind: event.kind === 'done' ? 'planned' : 'done' });
              }}
            />
          ))}

          {dayTasks.length > 0 ? (
            <>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Tareas del día
              </Text>
              {dayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onPress={() => {}}
                />
              ))}
            </>
          ) : null}
        </View>
      )}

      <EventForm
        visible={formVisible}
        event={editing}
        defaultDate={selected}
        onClose={() => setFormVisible(false)}
        onSubmit={(input) => {
          if (editing) {
            updateEvent(editing.id, input);
          } else {
            addEvent(input);
          }
          if (!isSameMonth(input.date, month)) {
            setMonth(input.date.slice(0, 7));
          }
          setSelected(input.date);
        }}
        onDelete={editing ? () => removeEvent(editing.id) : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    gap: 8,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dayHeader: {
    marginTop: 24,
    gap: 2,
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
});
