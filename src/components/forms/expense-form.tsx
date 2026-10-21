import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { ExpenseInput } from '@/store/app-provider';
import { EXPENSE_CATEGORIES, type FixedExpense } from '@/store/types';

interface ExpenseFormProps {
  visible: boolean;
  /** Expense being edited. `null` creates a new one. */
  expense?: FixedExpense | null;
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => void;
  onDelete?: () => void;
}

export function ExpenseForm({
  visible,
  expense,
  onClose,
  onSubmit,
  onDelete,
}: ExpenseFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setName(expense?.name ?? '');
    setAmount(expense?.amount ?? 0);
    setCategory(expense?.category ?? EXPENSE_CATEGORIES[0]);
    setDayOfMonth(expense?.dayOfMonth);
  }, [visible, expense]);

  const handleSubmit = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    onSubmit({
      name: cleanName,
      amount,
      category,
      dayOfMonth,
      active: expense?.active ?? true,
    });
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={expense ? 'Editar gasto' : 'Nuevo gasto fijo'}
      subtitle="Cantidades que se repiten cada mes"
      footer={
        <View style={styles.footer}>
          {expense && onDelete ? (
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
            label={expense ? 'Guardar' : 'Añadir gasto'}
            onPress={handleSubmit}
            style={{ flex: 1 }}
          />
        </View>
      }>
      <TextField
        label="Nombre"
        placeholder="Ej. Alquiler"
        value={name}
        onChangeText={setName}
        autoFocus={!expense}
        returnKeyType="next"
      />

      <AmountField
        label="Importe mensual"
        value={amount}
        onChange={setAmount}
        hint="Lo que se paga cada mes"
      />

      <View style={styles.block}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Categoría
        </Text>
        <View style={styles.chips}>
          {EXPENSE_CATEGORIES.map((option) => {
            const active = option === category;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(option)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                    borderRadius: theme.radius.pill,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: active ? theme.colors.onPrimary : theme.colors.textSecondary },
                  ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Día de cobro (opcional)
        </Text>
        <View style={styles.dayRow}>
          <Pressable
            accessibilityLabel="Quitar día de cobro"
            onPress={() => setDayOfMonth(undefined)}
            style={({ pressed }) => [
              styles.dayButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </Pressable>

          <View
            style={[
              styles.dayValue,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
              },
            ]}>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>
              {dayOfMonth ? `Día ${dayOfMonth}` : 'Sin día'}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Aumentar día de cobro"
            onPress={() => setDayOfMonth((current) => (current ?? 0) + 1 > 31 ? 1 : (current ?? 0) + 1)}
            style={({ pressed }) => [
              styles.dayButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons name="add" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
          Se usa para ordenar la lista de cobros del mes.
        </Text>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayValue: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
});
