import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DatePicker } from '@/components/calendar/date-picker';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { EventInput } from '@/store/app-provider';
import type { CalendarEvent, EventKind } from '@/store/types';
import { formatDateLong, isValidTime, todayISO } from '@/utils/date';

interface EventFormProps {
  visible: boolean;
  event?: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (input: EventInput) => void;
  onDelete?: () => void;
}

const KIND_OPTIONS = [
  { value: 'planned' as const, label: 'Me toca' },
  { value: 'done' as const, label: 'Ya lo hice' },
];

export function EventForm({
  visible,
  event,
  defaultDate,
  onClose,
  onSubmit,
  onDelete,
}: EventFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState<EventKind>('planned');
  const [date, setDate] = useState<string>(todayISO());
  const [time, setTime] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(event?.title ?? '');
    setNotes(event?.notes ?? '');
    setKind(event?.kind ?? 'planned');
    setDate(event?.date ?? defaultDate ?? todayISO());
    setTime(event?.time ?? '');
  }, [visible, event, defaultDate]);

  const handleSubmit = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onSubmit({
      title: cleanTitle,
      notes: notes.trim() || undefined,
      kind,
      date,
      time: isValidTime(time) ? time : undefined,
    });
    onClose();
  };

  return (
    <>
      <ModalSheet
        visible={visible}
        onClose={onClose}
        title={event ? 'Editar evento' : 'Nuevo evento'}
        subtitle="Apunta qué has hecho o qué te toca hacer"
        footer={
          <View style={styles.footer}>
            {event && onDelete ? (
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
              label={event ? 'Guardar' : 'Añadir'}
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>
        }>
        <TextField
          label="Título"
          placeholder="¿Qué ocurrió o qué toca?"
          value={title}
          onChangeText={setTitle}
          autoFocus={!event}
        />

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Tipo
          </Text>
          <Segmented options={KIND_OPTIONS} value={kind} onChange={setKind} />
        </View>

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Fecha
          </Text>
          <Pressable
            onPress={() => setPickerVisible(true)}
            style={({ pressed }) => [
              styles.rowButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons name="calendar-outline" size={17} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              {formatDateLong(date)}
            </Text>
          </Pressable>
        </View>

        <TextField
          label="Hora (opcional)"
          placeholder="HH:MM"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          hint={time && !isValidTime(time) ? 'Usa el formato HH:MM' : undefined}
        />

        <TextField
          label="Notas"
          placeholder="Detalles adicionales (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ModalSheet>

      <DatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={date}
        onSelect={setDate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  rowButton: {
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
