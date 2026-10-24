import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { NOTE_COLORS, type BoldRange, type NoteColor } from '@/store/types';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';

const NOTE_COLORS_MAP: Record<NoteColor, string> = {
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

const NOTE_COLORS_DARK: Record<NoteColor, string> = {
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

/** Adds `[start, end)` to the ranges, merging overlaps and touching ranges. */
function addRange(ranges: BoldRange[], start: number, end: number): BoldRange[] {
  const next = [...ranges, { start, end }].sort((a, b) => a.start - b.start);
  const merged: BoldRange[] = [];

  for (const range of next) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

/** Removes `[start, end)` from the ranges, splitting them when needed. */
function removeRange(ranges: BoldRange[], start: number, end: number): BoldRange[] {
  const result: BoldRange[] = [];

  for (const range of ranges) {
    if (range.end <= start || range.start >= end) {
      result.push(range);
      continue;
    }
    if (range.start < start) result.push({ start: range.start, end: start });
    if (range.end > end) result.push({ start: end, end: range.end });
  }

  return result.filter((range) => range.end > range.start);
}

function isFullyBold(ranges: BoldRange[], start: number, end: number): boolean {
  let covered = start;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sorted) {
    if (range.end <= covered) continue;
    if (range.start > covered) return false;
    covered = Math.max(covered, range.end);
    if (covered >= end) return true;
  }

  return covered >= end;
}

/** Keeps bold ranges aligned with the text after an edit. */
function adjustRanges(ranges: BoldRange[], oldText: string, newText: string): BoldRange[] {
  if (ranges.length === 0) return ranges;

  const oldLength = oldText.length;
  const newLength = newText.length;
  const minLength = Math.min(oldLength, newLength);

  let prefix = 0;
  while (prefix < minLength && oldText[prefix] === newText[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < minLength - prefix &&
    oldText[oldLength - 1 - suffix] === newText[newLength - 1 - suffix]
  ) {
    suffix += 1;
  }

  const oldEnd = oldLength - suffix;
  const delta = newLength - oldLength;

  return ranges
    .map((range) => {
      if (range.end <= prefix) return range;
      if (range.start >= oldEnd) return { start: range.start + delta, end: range.end + delta };

      // The edit happened inside (or around) this range: keep it covering the
      // inserted text and clamp it to the new content length.
      const start = Math.min(range.start, prefix);
      const end = Math.max(start, range.end + delta);
      return {
        start: Math.max(0, Math.min(start, newLength)),
        end: Math.max(0, Math.min(end, newLength)),
      };
    })
    .filter((range) => range.end > range.start);
}

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, updateNote, removeNote } = useApp();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const note = state.notes.find((n) => n.id === id);

  const [colorPicker, setColorPicker] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const boldRanges = useMemo(() => note?.boldRanges ?? [], [note?.boldRanges]);

  const bg = useMemo(() => {
    if (!note) return theme.colors.background;
    return theme.isDark ? NOTE_COLORS_DARK[note.color] : NOTE_COLORS_MAP[note.color];
  }, [note, theme]);

  if (!note) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView
          edges={['top', 'bottom']}
          style={[styles.safe, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.headerRow}>
            <IconButton name="arrow-back" accessibilityLabel="Volver" onPress={() => router.back()} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nota no encontrada</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.center}>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              Esta nota ya no existe
            </Text>
            <Button label="Volver" onPress={() => router.back()} style={{ marginTop: 16 }} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  const handleDelete = () => {
    Alert.alert('Eliminar nota', '¿Seguro que quieres eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeNote(note.id);
          router.back();
        },
      },
    ]);
  };

  const handleContentChange = (text: string) => {
    updateNote(note.id, {
      content: text,
      boldRanges: adjustRanges(boldRanges, note.content, text),
    });
  };

  const toggleBold = () => {
    const { start, end } = selection;
    if (start === end) return;

    const next = isFullyBold(boldRanges, start, end)
      ? removeRange(boldRanges, start, end)
      : addRange(boldRanges, start, end);

    updateNote(note.id, { boldRanges: next });

    // Keep the same portion selected so the user can keep styling it.
    setTimeout(() => inputRef.current?.setSelection(start, end), 0);
  };

  const renderStyledContent = () => {
    const content = note.content;
    if (!content) return null;

    const sorted = [...boldRanges]
      .map((range) => ({
        start: Math.max(0, Math.min(range.start, content.length)),
        end: Math.max(0, Math.min(range.end, content.length)),
      }))
      .filter((range) => range.end > range.start)
      .sort((a, b) => a.start - b.start);

    const nodes: ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((range, index) => {
      if (range.start > cursor) {
        nodes.push(<Text key={`plain-${index}`}>{content.slice(cursor, range.start)}</Text>);
      }
      nodes.push(
        <Text key={`bold-${index}`} style={styles.bold}>
          {content.slice(range.start, range.end)}
        </Text>,
      );
      cursor = Math.max(cursor, range.end);
    });

    if (cursor < content.length) {
      nodes.push(<Text key="tail">{content.slice(cursor)}</Text>);
    }

    return nodes;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: bg }]}>
        <View style={[styles.headerRow, { paddingTop: insets.top > 0 ? 10 : 14 }]}>
          <IconButton name="arrow-back" accessibilityLabel="Volver" onPress={() => router.back()} />
          <TextInput
            value={note.title}
            onChangeText={(text) => updateNote(note.id, { title: text })}
            placeholder="Sin título"
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.titleInput, { color: theme.colors.text }]}
            multiline={false}
          />
          <View style={styles.headerActions}>
            <IconButton
              name="color-palette-outline"
              accessibilityLabel="Cambiar color"
              onPress={() => setColorPicker(true)}
            />
            <IconButton name="trash-outline" accessibilityLabel="Eliminar" onPress={handleDelete} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editorWrap}>
            <TextInput
              ref={inputRef}
              value={note.content}
              onChangeText={handleContentChange}
              onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
              placeholder="Escribe tu nota aquí..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.content, styles.contentInput, { color: 'transparent' }]}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              autoFocus={!note.title && !note.content}
              selectionColor={`${theme.colors.primary}66`}
              cursorColor={theme.colors.primary}
              spellCheck={false}
              autoCorrect={false}
            />
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Text style={[styles.content, { color: theme.colors.text }]}>
                {renderStyledContent()}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 12 },
          ]}
        >
          <Pressable onPress={toggleBold} style={styles.boldButton}>
            <Text style={[styles.boldLabel, { color: theme.colors.text }]}>B</Text>
          </Pressable>
        </View>

        <ModalSheet
          visible={colorPicker}
          onClose={() => setColorPicker(false)}
          title="Color de la nota"
          subtitle="Este color se usará como fondo"
        >
          <View style={styles.colorGrid}>
            {NOTE_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => {
                  updateNote(note.id, { color });
                  setColorPicker(false);
                }}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: theme.isDark ? NOTE_COLORS_DARK[color] : NOTE_COLORS_MAP[color],
                    borderColor: note.color === color ? theme.colors.primary : theme.colors.border,
                    borderWidth: note.color === color ? 3 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                {note.color === color ? (
                  <Ionicons name="checkmark" size={20} color={theme.colors.text} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </ModalSheet>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  editorWrap: {
    position: 'relative',
    minHeight: 240,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  contentInput: {
    minHeight: 240,
    textAlignVertical: 'top',
  },
  bold: {
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  boldButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
