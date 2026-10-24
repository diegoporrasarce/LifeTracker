import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { NOTE_SORT_LABELS, NOTE_SORT_OPTIONS, type NoteSort } from '@/utils/note-sort';

interface NoteSortBarProps {
  value: NoteSort;
  onChange: (value: NoteSort) => void;
}

export function NoteSortBar({ value, onChange }: NoteSortBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[theme.typography.caption, styles.label, { color: theme.colors.textTertiary }]}>
        Ordenar
      </Text>
      {NOTE_SORT_OPTIONS.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                borderColor: active ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.caption,
                { color: active ? theme.colors.onPrimary : theme.colors.textSecondary },
              ]}
            >
              {NOTE_SORT_LABELS[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  label: {
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
