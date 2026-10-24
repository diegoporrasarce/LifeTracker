import type { NoteColor } from '@/store/types';

export const NOTE_COLORS_MAP: Record<NoteColor, string> = {
  yellow: '#FFF3B0',
  orange: '#FFE0B2',
  pink: '#F8BBD0',
  red: '#FFCDD2',
  purple: '#E1BEE7',
  blue: '#BBDEFB',
  cyan: '#B2EBF2',
  green: '#C8E6C9',
  teal: '#B2DFDB',
  gray: '#ECEFF1',
};

export const NOTE_COLORS_DARK: Record<NoteColor, string> = {
  yellow: '#3F3A20',
  orange: '#3F2F1E',
  pink: '#3F2432',
  red: '#3F2325',
  purple: '#33273C',
  blue: '#22314A',
  cyan: '#1F3338',
  green: '#24382A',
  teal: '#1F3433',
  gray: '#2F343A',
};

/** Order used when sorting notes by colour (same as the ColorNote palette). */
export const NOTE_COLOR_ORDER: NoteColor[] = [
  'yellow',
  'orange',
  'pink',
  'red',
  'purple',
  'blue',
  'cyan',
  'green',
  'teal',
  'gray',
];

export function noteBackground(color: NoteColor, isDark: boolean): string {
  return isDark ? NOTE_COLORS_DARK[color] : NOTE_COLORS_MAP[color];
}
