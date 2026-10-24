import { NOTE_COLOR_ORDER } from '@/constants/note-colors';
import type { Note } from '@/store/types';

export type NoteSort = 'recent' | 'title' | 'color' | 'manual';

export const NOTE_SORT_LABELS: Record<NoteSort, string> = {
  recent: 'Recientes',
  title: 'Título',
  color: 'Color',
  manual: 'Manual',
};

export const NOTE_SORT_OPTIONS: NoteSort[] = ['recent', 'title', 'color', 'manual'];

export function sortNotes(notes: Note[], sort: NoteSort): Note[] {
  const list = [...notes];

  switch (sort) {
    case 'title':
      return list.sort((a, b) => {
        const titleA = a.title.trim() || a.content.trim();
        const titleB = b.title.trim() || b.content.trim();
        return titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
      });

    case 'color':
      return list.sort((a, b) => {
        const indexA = NOTE_COLOR_ORDER.indexOf(a.color);
        const indexB = NOTE_COLOR_ORDER.indexOf(b.color);
        if (indexA !== indexB) return indexA - indexB;
        return b.updatedAt.localeCompare(a.updatedAt);
      });

    case 'manual':
      return list.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return b.updatedAt.localeCompare(a.updatedAt);
      });

    case 'recent':
    default:
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}
