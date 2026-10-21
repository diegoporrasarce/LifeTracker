import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { AccountPalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AccountInput } from '@/store/app-provider';
import { ACCOUNT_TYPE_LABELS, type Account, type AccountType } from '@/store/types';

interface AccountFormProps {
  visible: boolean;
  account?: Account | null;
  onClose: () => void;
  onSubmit: (input: AccountInput) => void;
  onDelete?: () => void;
}

const TYPE_OPTIONS = (['bank', 'broker'] as AccountType[]).map((value) => ({
  value,
  label: ACCOUNT_TYPE_LABELS[value],
}));

export function AccountForm({
  visible,
  account,
  onClose,
  onSubmit,
  onDelete,
}: AccountFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [color, setColor] = useState<string>(AccountPalette[0]);

  useEffect(() => {
    if (!visible) return;
    setName(account?.name ?? '');
    setType(account?.type ?? 'bank');
    setColor(account?.color ?? AccountPalette[0]);
  }, [visible, account]);

  const handleSubmit = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    onSubmit({ name: cleanName, type, color });
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={account ? 'Editar cuenta' : 'Nueva cuenta'}
      subtitle="Un banco, un bróker o cualquier lugar donde tengas dinero"
      footer={
        <View style={styles.footer}>
          {account && onDelete ? (
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
            label={account ? 'Guardar' : 'Añadir cuenta'}
            onPress={handleSubmit}
            style={{ flex: 1 }}
          />
        </View>
      }>
      <TextField
        label="Nombre"
        placeholder="Ej. Bróker Indexado"
        value={name}
        onChangeText={setName}
        autoFocus={!account}
      />

      <View style={styles.block}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Tipo
        </Text>
        <Segmented options={TYPE_OPTIONS} value={type} onChange={setType} />
      </View>

      <View style={styles.block}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Color
        </Text>
        <View style={styles.swatches}>
          {AccountPalette.map((swatch) => (
            <Pressable
              key={swatch}
              accessibilityRole="button"
              accessibilityLabel={`Color ${swatch}`}
              accessibilityState={{ selected: color === swatch }}
              onPress={() => setColor(swatch)}
              style={({ pressed }) => [
                styles.swatch,
                {
                  backgroundColor: swatch,
                  borderColor: color === swatch ? theme.colors.text : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
});
