import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Headless layout used on the web, where native tabs have no equivalent. */
export default function WebTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={[
          styles.tabList,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}>
        <TabTrigger name="index" href="/">
          Tareas
        </TabTrigger>
        <TabTrigger name="calendario" href="/calendario">
          Calendario
        </TabTrigger>
        <TabTrigger name="cartera" href="/cartera">
          Cartera
        </TabTrigger>
        <TabTrigger name="gastos" href="/gastos">
          Gastos
        </TabTrigger>
        <TabTrigger name="deudas" href="/deudas">
          Deudas
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
