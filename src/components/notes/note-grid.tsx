import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { noteBackground } from '@/constants/note-colors';
import { useTheme } from '@/hooks/use-theme';
import type { Note } from '@/store/types';

const GAP = 10;
const CARD_HEIGHT = 140;

interface NoteGridProps {
  notes: Note[];
  onPressNote: (note: Note) => void;
  onReorder: (orderedIds: string[]) => void;
  empty?: ReactNode;
}

/**
 * Two-column grid of notes with manual reordering.
 *
 * Long pressing a card picks it up; moving the finger exchanges its position
 * with the neighbouring slots and releasing stores the new order.
 */
export function NoteGrid({ notes, onPressNote, onReorder, empty }: NoteGridProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<string[] | null>(null);

  const startIndexRef = useRef(0);
  const previewRef = useRef<string[] | null>(null);
  const suppressPressRef = useRef(0);

  const cellWidth = gridWidth > 0 ? (gridWidth - GAP) / 2 : 0;

  const notesById = useMemo(() => {
    const map = new Map<string, Note>();
    notes.forEach((note) => map.set(note.id, note));
    return map;
  }, [notes]);

  const displayNotes = useMemo(() => {
    if (!previewOrder) return notes;
    return previewOrder
      .map((id) => notesById.get(id))
      .filter((note): note is Note => note !== undefined);
  }, [previewOrder, notes, notesById]);

  const updatePreview = (next: string[]) => {
    previewRef.current = next;
    setPreviewOrder(next);
  };

  const beginDrag = (id: string, index: number) => {
    startIndexRef.current = index;
    setDraggingId(id);
    updatePreview(notes.map((note) => note.id));
    void Haptics.selectionAsync();
  };

  const moveDrag = (id: string, translationX: number, translationY: number) => {
    const preview = previewRef.current;
    if (!preview || cellWidth <= 0) return;

    const start = startIndexRef.current;
    const startRow = Math.floor(start / 2);
    const startCol = start % 2;
    const colWidth = cellWidth + GAP;
    const rowHeight = CARD_HEIGHT + GAP;

    const col = Math.min(1, Math.max(0, Math.round(startCol + translationX / colWidth)));
    const row = Math.max(0, Math.round(startRow + translationY / rowHeight));
    const target = row * 2 + col;

    const without = preview.filter((noteId) => noteId !== id);
    const insertAt = Math.max(0, Math.min(target, without.length));
    without.splice(insertAt, 0, id);

    if (without.join('|') !== preview.join('|')) {
      updatePreview(without);
    }
  };

  const endDrag = () => {
    const order = previewRef.current;
    if (order) onReorder(order);

    previewRef.current = null;
    setPreviewOrder(null);
    setDraggingId(null);
    suppressPressRef.current = Date.now() + 350;
  };

  const handlePress = (note: Note) => {
    if (Date.now() < suppressPressRef.current) return;
    onPressNote(note);
  };

  if (notes.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <View
      style={styles.grid}
      onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
    >
      {displayNotes.map((note, index) => (
        <DraggableNoteCard
          key={note.id}
          note={note}
          index={index}
          width={gridWidth > 0 ? cellWidth : '48%'}
          dragging={draggingId === note.id}
          onBegin={beginDrag}
          onMove={moveDrag}
          onEnd={endDrag}
          onPress={handlePress}
        />
      ))}
    </View>
  );
}

interface DraggableNoteCardProps {
  note: Note;
  index: number;
  width: DimensionValue;
  dragging: boolean;
  onBegin: (id: string, index: number) => void;
  onMove: (id: string, translationX: number, translationY: number) => void;
  onEnd: (id: string) => void;
  onPress: (note: Note) => void;
}

function DraggableNoteCard({
  note,
  index,
  width,
  dragging,
  onBegin,
  onMove,
  onEnd,
  onPress,
}: DraggableNoteCardProps) {
  const theme = useTheme();

  const handlers = useRef({ onBegin, onMove, onEnd, onPress });
  handlers.current = { onBegin, onMove, onEnd, onPress };

  const indexRef = useRef(index);
  indexRef.current = index;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(220)
        .runOnJS(true)
        .onStart(() => handlers.current.onBegin(note.id, indexRef.current))
        .onUpdate((event) =>
          handlers.current.onMove(note.id, event.translationX, event.translationY),
        )
        .onFinalize(() => handlers.current.onEnd(note.id)),
    [note.id],
  );

  const preview = note.content.replace(/\n/g, ' ').trim();

  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        onPress={() => handlers.current.onPress(note)}
        style={[
          styles.card,
          {
            width,
            backgroundColor: noteBackground(note.color, theme.isDark),
            opacity: dragging ? 0.86 : 1,
            transform: [{ scale: dragging ? 1.03 : 1 }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          {note.title ? (
            <Text
              numberOfLines={1}
              style={[theme.typography.subheading, styles.cardTitle, { color: theme.colors.text }]}
            >
              {note.title}
            </Text>
          ) : null}
          {note.pinned ? (
            <Ionicons name="pin" size={13} color={theme.colors.textTertiary} />
          ) : null}
        </View>
        <Text numberOfLines={4} style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {preview || 'Sin contenido'}
        </Text>
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GAP,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTitle: {
    flex: 1,
  },
});
