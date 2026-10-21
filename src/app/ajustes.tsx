import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { AmountField } from '@/components/ui/amount-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { parseState, serialiseState } from '@/store/storage';

export default function SettingsScreen() {
  const theme = useTheme();
  const { state, setMonthlyIncome, loadSampleData, resetAll, replaceState } = useApp();

  const [income, setIncome] = useState(state.settings.monthlyIncome);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const saveIncome = (value: number) => {
    setIncome(value);
    setMonthlyIncome(value);
  };

  const handleExport = async () => {
    try {
      await Share.share({
        title: 'Copia de LifeTracker',
        message: serialiseState(state),
      });
    } catch (error) {
      setMessage('No se pudo compartir la copia.');
    }
  };

  const handleImport = () => {
    const raw = importText.trim();
    if (!raw) {
      setMessage('Pega primero el contenido de una copia.');
      return;
    }

    try {
      const next = parseState(raw);
      replaceState(next);
      setIncome(next.settings.monthlyIncome);
      setImportText('');
      setMessage('Copia importada correctamente.');
    } catch (error) {
      setMessage('El texto pegado no parece una copia válida.');
    }
  };

  const confirmImport = () => {
    Alert.alert(
      'Importar copia',
      'Se reemplazarán todos los datos actuales por los de la copia. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Importar', style: 'destructive', onPress: handleImport },
      ],
    );
  };

  const confirmSample = () => {
    Alert.alert(
      'Cargar datos de ejemplo',
      'Se reemplazarán todos los datos actuales por un conjunto de ejemplo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: () => {
            loadSampleData();
            setMessage('Datos de ejemplo cargados.');
          },
        },
      ],
    );
  };

  const confirmErase = () => {
    Alert.alert('Borrar todo', 'Se eliminarán todas las tareas, cuentas y deudas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar todo',
        style: 'destructive',
        onPress: () => {
          resetAll();
          setIncome(0);
          setMessage('Todos los datos se han borrado.');
        },
      },
    ]);
  };

  return (
    <Screen variant="stack">
      <View style={styles.headerBlock}>
        <Header title="Ajustes" subtitle="Ingresos, copias y privacidad" />
      </View>

      <Card>
        <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
          Ingresos mensuales
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          Una estimación sirve para saber cuánto te queda después de los gastos fijos.
        </Text>

        <View style={styles.incomeField}>
          <AmountField
            value={income}
            onChange={saveIncome}
            placeholder="0,00"
            hint="Se guarda al instante en el dispositivo"
          />
        </View>
      </Card>

      <View style={styles.section}>
        <Card>
          <View style={styles.rowTitle}>
            <Ionicons name="share-outline" size={18} color={theme.colors.primary} />
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Copia de seguridad
            </Text>
          </View>

          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Exporta todos tus datos como texto JSON y guárdalos donde quieras. Para restaurar,
            pega el contenido en el campo de abajo.
          </Text>

          <View style={styles.actions}>
            <Button
              label="Exportar"
              variant="secondary"
              onPress={() => void handleExport()}
              style={{ flex: 1 }}
            />
          </View>

          <TextField
            label="Pegar una copia"
            placeholder="Pega aquí el JSON de una copia"
            value={importText}
            onChangeText={setImportText}
            multiline
          />

          <Button label="Importar copia" variant="secondary" onPress={confirmImport} full />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <View style={styles.rowTitle}>
            <Ionicons name="flask-outline" size={18} color={theme.colors.warning} />
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Datos de ejemplo
            </Text>
          </View>

          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Carga un conjunto de datos ficticios para probar la app sin teclear nada.
          </Text>

          <Button label="Cargar ejemplo" variant="secondary" onPress={confirmSample} full />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <View style={styles.rowTitle}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Borrar todo
            </Text>
          </View>

          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Elimina de este dispositivo tareas, eventos, cuentas, gastos y deudas. No se puede
            deshacer.
          </Text>

          <Button label="Borrar todos los datos" variant="danger" onPress={confirmErase} full />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <View style={styles.rowTitle}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.success} />
            <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
              Privacidad
            </Text>
          </View>

          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Todo se guarda solo en este dispositivo (almacenamiento local de la app). No hay
            cuentas, servidores ni analíticas: nada de lo que escribas sale de tu teléfono.
          </Text>
        </Card>
      </View>

      {message ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  incomeField: {
    marginTop: 12,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
});
