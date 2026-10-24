/**
 * Design tokens for LifeTracker.
 *
 * Every colour has a light and a dark variant so the whole app can follow the
 * system appearance. Spacing, radii and typography live here too, so the
 * screens stay consistent without repeating magic numbers.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF0F5',
    surfaceMuted: '#F1F3F7',
    text: '#10141B',
    textSecondary: '#5C6673',
    textTertiary: '#8D97A4',
    border: '#E3E8EF',
    borderStrong: '#CFD6E0',

    primary: '#2F6BFF',
    primarySoft: '#E8EFFF',
    onPrimary: '#FFFFFF',

    success: '#0E9E8D',
    successSoft: '#DFF4F1',
    danger: '#DE3E43',
    dangerSoft: '#FDEBEC',
    warning: '#B9760A',
    warningSoft: '#FCF0DA',

    tabBar: '#FFFFFF',
    shadow: '#0A1020',
  },
  dark: {
    background: '#0A0D13',
    surface: '#141922',
    surfaceAlt: '#1B222D',
    surfaceMuted: '#191F29',
    text: '#F1F4F9',
    textSecondary: '#98A3B2',
    textTertiary: '#697485',
    border: '#232B37',
    borderStrong: '#313B49',

    primary: '#5B8BFF',
    primarySoft: '#17203A',
    onPrimary: '#FFFFFF',

    success: '#2DD4BF',
    successSoft: '#0E2A28',
    danger: '#FF6B6E',
    dangerSoft: '#331417',
    warning: '#FFB84D',
    warningSoft: '#33240D',

    tabBar: '#0F131A',
    shadow: '#000000',
  },
} as const;

export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Typography = {
  display: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.8 },
  title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.3 },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Colours used to tag every account, so they are easy to recognise at a glance. */
export const AccountPalette = [
  '#2F6BFF',
  '#7A5AF8',
  '#0E9E8D',
  '#E8590C',
  '#D6336C',
  '#0B7285',
  '#F08C00',
  '#5C6673',
] as const;
