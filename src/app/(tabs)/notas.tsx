import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteGrid } from '@/components/notes/note-grid';
import { NoteSortBar } from '@/components/notes/note-sort-bar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { IconButton } from '@/components/ui/icon-button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { TextField } from '@/components/ui/text-field';
import { noteBackground } from '@/constants/note-colors';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-provider';
import { NOTE_COLORS, type NoteColor } from '@/store/types';
import { sortNotes, type NoteSort } from '@/utils/note-sort';

export default function NotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, addNote, addNoteFolder, removeNoteFolder, reorderNotes } = useApp();

  const [view, setView] = useState<'all' | 'folders' | 'archived'>('all');
  const [sort, setSort] = useState<NoteSort>('recent');
  const [folderFormVisible, setFolderFormVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState<NoteColor>('blue');

  const folders = state.noteFolders;

  const notes = useMemo(() => {
    if (view === 'archived') return sortNotes(state.notes.filter((n) => n.archived), sort);
    if (view === 'folders') return [];
    return sortNotes(
      state.notes.filter((n) => !n.archived && n.folderId === null),
      sort,
    );
  }, [state.notes, view, sort]);

  const createFolder = () => {
    if (!folderName.trim()) return;
    addNoteFolder({ name: folderName.trim(), color: folderColor });
    setFolderName('');
    setFolderFormVisible(false);
  };

  const openNewNote = () => {
    const note = addNote({
      folderId: null,
      title: '',
      content: '',
      color: 'yellow',
      pinned: false,
      archived: false,
    });
    router.push({ pathname: '/nota/[id]', params: { id: note.id } });
  };

  const openNote = (id: string) => {
    router.push({ pathname: '/nota/[id]', params: { id } });
  };

  const handleReorder = (orderedIds: string[]) => {
    reorderNotes(orderedIds);
    setSort('manual');
  };

  const subtitle =
    view === 'folders' ? 'Carpetas' : view === 'archived' ? 'Archivo' : 'Todas las notas';

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <Header
          title="Notas"
          subtitle={subtitle}
          right={
            view === 'folders' ? (
              <IconButton
                name="folder-open-outline"
                accessibilityLabel="Nueva carpeta"
                onPress={() => setFolderFormVisible(true)}
              />
            ) : null
          }
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.filters, { paddingHorizontal: theme.spacing.md }]}>
          {(['all', 'folders', 'archived'] as const).map((option) => {
            const active = view === option;
            const label = option === 'all' ? 'Todas' : option === 'folders' ? 'Carpetas' : 'Archivo';
            return (
              <Pressable
                key={option}
                onPress={() => setView(option)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: active ? theme.colors.onPrimary : theme.colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {view === 'folders' ? (
          folders.length === 0 ? (
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <EmptyState
                icon="folder-outline"
                title="Sin carpetas"
                message="Crea carpetas para organizar tus notas al estilo ColorNote."
                action={
                  <Button
                    label="Crear carpeta"
                    onPress={() => setFolderFormVisible(true)}
                    icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
                  />
                }
              />
            </View>
          ) : (
            <View style={[styles.folderGrid, { paddingHorizontal: theme.spacing.md }]}>
              {folders.map((folder) => {
                const count = state.notes.filter((n) => !n.archived && n.folderId === folder.id).length;
                return (
                  <Pressable
                    key={folder.id}
                    onPress={() => router.push({ pathname: '/carpeta/[id]', params: { id: folder.id } })}
                    onLongPress={() => {
                      Alert.alert('Carpeta', folder.name, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => removeNoteFolder(folder.id),
                        },
                      ]);
                    }}
                    style={[
                      styles.folderCard,
                      { backgroundColor: noteBackground(folder.color, theme.isDark) },
                    ]}
                  >
                    <Ionicons name="folder" size={26} color={theme.colors.text} />
                    <Text numberOfLines={1} style={[theme.typography.subheading, { color: theme.colors.text }]}>
                      {folder.name}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      {count} {count === 1 ? 'nota' : 'notas'}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setFolderFormVisible(true)}
                style={[
                  styles.folderCard,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Ionicons name="add" size={28} color={theme.colors.textSecondary} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  Nueva carpeta
                </Text>
              </Pressable>
            </View>
          )
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <NoteSortBar value={sort} onChange={setSort} />
            {notes.length === 0 ? (
              <EmptyState
                icon={view === 'archived' ? 'archive-outline' : 'document-text-outline'}
                title={view === 'archived' ? 'Archivo vacío' : 'Sin notas'}
                message={
                  view === 'archived'
                    ? 'Las notas que archives aparecerán aquí.'
                    : 'Pulsa el + para crear tu primera nota al estilo ColorNote.'
                }
                action={
                  view !== 'archived' ? (
                    <Button
                      label="Nueva nota"
                      onPress={openNewNote}
                      icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
                    />
                  ) : undefined
                }
              />
            ) : (
              <NoteGrid
                notes={notes}
                onPressNote={(note) => openNote(note.id)}
                onReorder={handleReorder}
              />
            )}
          </View>
        )}
      </ScrollView>

      {view !== 'folders' && view !== 'archived' ? (
        <Pressable
          onPress={openNewNote}
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              bottom: insets.bottom + 16,
              right: theme.spacing.md,
            },
          ]}
        >
          <Ionicons name="add" size={28} color={theme.colors.onPrimary} />
        </Pressable>
      ) : null}

      <ModalSheet
        visible={folderFormVisible}
        onClose={() => setFolderFormVisible(false)}
        title="Nueva carpeta"
        subtitle="Organiza tus notas"
        footer={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={() => setFolderFormVisible(false)}
              style={{ flex: 1 }}
            />
            <Button label="Crear" onPress={createFolder} style={{ flex: 1 }} />
          </View>
        }
      >
        <TextField label="Nombre" value={folderName} onChangeText={setFolderName} placeholder="Ej. Viajes" />
        <View style={styles.colorRow}>
          {NOTE_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setFolderColor(color)}
              style={[
                styles.colorDot,
                {
                  backgroundColor: noteBackground(color, theme.isDark),
                  borderColor: folderColor === color ? theme.colors.primary : theme.colors.border,
                  borderWidth: folderColor === color ? 2 : StyleSheet.hairlineWidth,
                },
              ]}
            />
          ))}
        </View>
      </ModalSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  folderCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    minHeight: 90,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
