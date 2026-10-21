import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DatePicker } from '@/components/calendar/date-picker';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { TaskInput } from '@/store/app-provider';
import { PRIORITY_LABELS, type Priority, type Task } from '@/store/types';
import { formatDateLong } from '@/utils/date';

interface TaskFormProps {
  visible: boolean;
  /** Task being edited. `null` creates a new one. */
  task?: Task | null;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
  onDelete?: () => void;
}

const PRIORITY_OPTIONS = (['low', 'medium', 'high'] as Priority[]).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

export function TaskForm({
  visible,
  task,
  defaultDate,
  onClose,
  onSubmit,
  onDelete,
}: TaskFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setNotes(task?.notes ?? '');
    setPriority(task?.priority ?? 'medium');
    setDueDate(task?.dueDate ?? defaultDate);
  }, [visible, task, defaultDate]);

  const handleSubmit = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onSubmit({
      title: cleanTitle,
      notes: notes.trim() || undefined,
      done: task?.done ?? false,
      priority,
      dueDate,
    });
    onClose();
  };

  return (
    <>
      <ModalSheet
        visible={visible}
        onClose={onClose}
        title={task ? 'Editar tarea' : 'Nueva tarea'}
        footer={
          <View style={styles.footer}>
            {task && onDelete ? (
              <Button
                label="Eliminar"
                variant="danger"
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              />
            ) : null}
            <Button
              label={task ? 'Guardar' : 'Añadir tarea'}
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>
        }>
        <TextField
          label="Título"
          placeholder="¿Qué hay que hacer?"
          value={title}
          onChangeText={setTitle}
          autoFocus={!task}
          returnKeyType="next"
        />

        <TextField
          label="Notas"
          placeholder="Detalles adicionales (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Prioridad
          </Text>
          <Segmented
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        </View>

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Fecha
          </Text>
          <View style={styles.dateRow}>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [
                styles.dateButton,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius.md,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Ionicons name="calendar-outline" size={17} color={theme.colors.textSecondary} />
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                {dueDate ? formatDateLong(dueDate) : 'Sin fecha'}
              </Text>
            </Pressable>

            {dueDate ? (
              <Pressable
                onPress={() => setDueDate(undefined)}
                hitSlop={8}
                accessibilityLabel="Quitar fecha">
                <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ModalSheet>

      <DatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={dueDate}
        onSelect={setDueDate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
});
