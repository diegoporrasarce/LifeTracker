import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { AppProvider, useApp } from '@/store/app-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  const { ready } = useApp();
  const theme = useTheme();

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text, fontWeight: '700' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ajustes" options={{ title: 'Ajustes' }} />
        <Stack.Screen name="cuenta/[id]" options={{ title: 'Cuenta' }} />
      </Stack>
    </ThemeProvider>
  );
}
