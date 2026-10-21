import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DatePicker } from '@/components/calendar/date-picker';
import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { DebtInput } from '@/store/app-provider';
import { DEBT_KIND_LABELS, type Debt, type DebtDirection } from '@/store/types';
import { formatDateLong } from '@/utils/date';

interface DebtFormProps {
  visible: boolean;
  /** Debt being edited. `null` creates a new one. */
  debt?: Debt | null;
  onClose: () => void;
  onSubmit: (input: DebtInput) => void;
  onDelete?: () => void;
}

const KIND_OPTIONS = (['money', 'other'] as Debt['kind'][]).map((value) => ({
  value,
  label: DEBT_KIND_LABELS[value],
}));

const DIRECTION_OPTIONS: { value: DebtDirection; label: string }[] = [
  { value: 'they_owe_me', label: 'Me deben' },
  { value: 'i_owe', label: 'Yo debo' },
];

export function DebtForm({ visible, debt, onClose, onSubmit, onDelete }: DebtFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Debt['kind']>('money');
  const [amount, setAmount] = useState(0);
  const [direction, setDirection] = useState<DebtDirection>('they_owe_me');
  const [person, setPerson] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(debt?.title ?? '');
    setKind(debt?.kind ?? 'money');
    setAmount(debt?.amount ?? 0);
    setDirection(debt?.direction ?? 'they_owe_me');
    setPerson(debt?.person ?? '');
    setDueDate(debt?.dueDate);
    setNotes(debt?.notes ?? '');
  }, [visible, debt]);

  const handleSubmit = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onSubmit({
      title: cleanTitle,
      kind,
      amount: kind === 'money' ? amount : undefined,
      direction,
      person: person.trim() || undefined,
      dueDate,
      settled: debt?.settled ?? false,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <ModalSheet
        visible={visible}
        onClose={onClose}
        title={debt ? 'Editar deuda' : 'Nueva deuda'}
        subtitle="Dinero u objetos que te deben o que debes tú"
        footer={
          <View style={styles.footer}>
            {debt && onDelete ? (
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
              label={debt ? 'Guardar' : 'Añadir deuda'}
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>
        }>
        <TextField
          label="¿Qué?"
          placeholder="Ej. 30 € o un gorro"
          value={title}
          onChangeText={setTitle}
          autoFocus={!debt}
          returnKeyType="next"
        />

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Tipo
          </Text>
          <Segmented options={KIND_OPTIONS} value={kind} onChange={setKind} />
        </View>

        {kind === 'money' ? (
          <AmountField label="Cantidad" value={amount} onChange={setAmount} />
        ) : (
          <View
            style={[
              styles.hint,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
              },
            ]}>
            <Ionicons name="gift-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Sin cantidad: sirve para recordar cosas como un gorro o un libro.
            </Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Dirección
          </Text>
          <Segmented options={DIRECTION_OPTIONS} value={direction} onChange={setDirection} />
        </View>

        <TextField
          label="Con quién (opcional)"
          placeholder="Ej. Marta"
          value={person}
          onChangeText={setPerson}
          returnKeyType="next"
        />

        <View style={styles.block}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Fecha (opcional)
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

        <TextField
          label="Notas (opcional)"
          placeholder="Detalles adicionales"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ModalSheet>

      <DatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={dueDate}
        onSelect={setDueDate}
        title="Fecha de la deuda"
      />
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
