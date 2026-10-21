import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { SnapshotInput } from '@/store/app-provider';
import type { AccountSnapshot } from '@/store/types';
import { addMonths, currentMonthKey, monthLabelCapitalised } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

interface SnapshotFormProps {
  visible: boolean;
  snapshot?: AccountSnapshot | null;
  onClose: () => void;
  onSubmit: (input: SnapshotInput) => void;
  onDelete?: () => void;
}

export function SnapshotForm({
  visible,
  snapshot,
  onClose,
  onSubmit,
  onDelete,
}: SnapshotFormProps) {
  const theme = useTheme();
  const [month, setMonth] = useState(currentMonthKey());
  const [cash, setCash] = useState(0);
  const [invested, setInvested] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    setMonth(snapshot?.month ?? currentMonthKey());
    setCash(snapshot?.cash ?? 0);
    setInvested(snapshot?.invested ?? 0);
    setNote(snapshot?.note ?? '');
  }, [visible, snapshot]);

  const handleSubmit = () => {
    onSubmit({ month, cash, invested, note: note.trim() || undefined });
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={snapshot ? 'Editar balance' : 'Registrar balance'}
      subtitle="Guarda el estado de la cuenta para un mes concreto"
      footer={
        <View style={styles.footer}>
          {snapshot && onDelete ? (
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
            label={snapshot ? 'Guardar' : 'Registrar'}
            onPress={handleSubmit}
            style={{ flex: 1 }}
          />
        </View>
      }>
      <View style={styles.block}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Mes
        </Text>
        <View style={styles.monthRow}>
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
        {month !== currentMonthKey() ? (
          <Pressable onPress={() => setMonth(currentMonthKey())} hitSlop={8}>
            <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>
              Volver a este mes
            </Text>
          </Pressable>
        ) : null}
      </View>

      <AmountField
        label="Dinero en cartera"
        value={cash}
        onChange={setCash}
        hint="Efectivo y saldos disponibles"
      />

      <AmountField
        label="Dinero invertido"
        value={invested}
        onChange={setInvested}
        hint="Acciones, fondos, cripto, plazos..."
      />

      <View
        style={[
          styles.total,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
          },
        ]}>
        <Ionicons name="wallet-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, flex: 1 }]}>
          Total
        </Text>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>
          {formatCurrency(cash + invested)}
        </Text>
      </View>

      <TextField
        label="Nota (opcional)"
        placeholder="Ej. vendí parte del fondo"
        value={note}
        onChangeText={setNote}
      />
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
});
