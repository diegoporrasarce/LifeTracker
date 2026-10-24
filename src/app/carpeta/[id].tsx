import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteGrid } from '@/components/notes/note-grid';
import { NoteSortBar } from '@/components/notes/note-sort-bar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { sortNotes, type NoteSort } from '@/utils/note-sort';

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, addNote, removeNoteFolder, reorderNotes } = useApp();

  const [sort, setSort] = useState<NoteSort>('recent');

  const folder = state.noteFolders.find((f) => f.id === id);

  const notes = useMemo(() => {
    if (!id) return [];
    return sortNotes(
      state.notes.filter((n) => !n.archived && n.folderId === id),
      sort,
    );
  }, [state.notes, id, sort]);

  if (!folder) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerRow}>
            <IconButton name="arrow-back" accessibilityLabel="Volver" onPress={() => router.back()} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Carpeta no encontrada</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.center}>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              Esta carpeta ya no existe
            </Text>
            <Button label="Volver" onPress={() => router.back()} style={{ marginTop: 16 }} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  const openNewNote = () => {
    const note = addNote({
      folderId: id,
      title: '',
      content: '',
      color: 'yellow',
      pinned: false,
      archived: false,
    });
    router.push({ pathname: '/nota/[id]', params: { id: note.id } });
  };

  const handleReorder = (orderedIds: string[]) => {
    reorderNotes(orderedIds);
    setSort('manual');
  };

  const handleDeleteFolder = () => {
    Alert.alert('Eliminar carpeta', 'Las notas se moverán a "Sin carpeta". ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeNoteFolder(folder.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-back" accessibilityLabel="Volver" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.colors.text }]}>
              {folder.name}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              name="trash-outline"
              accessibilityLabel="Eliminar carpeta"
              onPress={handleDeleteFolder}
            />
            <IconButton
              name="add"
              accessibilityLabel="Nueva nota"
              onPress={openNewNote}
              filled
              color={theme.colors.primary}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <NoteSortBar value={sort} onChange={setSort} />
          {notes.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Carpeta vacía"
              message="Pulsa + para crear una nota dentro de esta carpeta."
              action={
                <Button
                  label="Nueva nota"
                  onPress={openNewNote}
                  icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
                />
              }
            />
          ) : (
            <NoteGrid
              notes={notes}
              onPressNote={(note) => router.push({ pathname: '/nota/[id]', params: { id: note.id } })}
              onReorder={handleReorder}
            />
          )}
        </ScrollView>
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
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
