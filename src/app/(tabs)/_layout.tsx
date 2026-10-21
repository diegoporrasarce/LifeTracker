import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.colors.background}
      tintColor={theme.colors.primary}
      iconColor={{ default: theme.colors.textTertiary, selected: theme.colors.primary }}
      labelStyle={{
        default: { color: theme.colors.textTertiary },
        selected: { color: theme.colors.primary },
      }}
      indicatorColor={theme.colors.primarySoft}
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Tareas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendario">
        <NativeTabs.Trigger.Label>Calendario</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cartera">
        <NativeTabs.Trigger.Label>Cartera</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.pie" md="donut_large" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="gastos">
        <NativeTabs.Trigger.Label>Gastos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="creditcard" md="credit_card" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="deudas">
        <NativeTabs.Trigger.Label>Deudas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" md="sync_alt" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
