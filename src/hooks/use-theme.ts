/**
 * Returns the active theme, following the system colour scheme.
 */

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
  };
}

export type Theme = ReturnType<typeof useTheme>;
