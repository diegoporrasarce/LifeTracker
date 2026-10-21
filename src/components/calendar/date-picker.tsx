import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthGrid } from '@/components/calendar/month-grid';
import { IconButton } from '@/components/ui/icon-button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { useTheme } from '@/hooks/use-theme';
import { addMonths, currentMonthKey, monthLabelCapitalised, todayISO } from '@/utils/date';

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  /** Currently selected date, `YYYY-MM-DD`. */
  value?: string;
  onSelect: (date: string) => void;
  title?: string;
}

/** Modal with a month grid used to pick a single date. */
export function DatePicker({
  visible,
  onClose,
  value,
  onSelect,
  title = 'Elegir fecha',
}: DatePickerProps) {
  const theme = useTheme();
  const [month, setMonth] = useState(() => value?.slice(0, 7) ?? currentMonthKey());

  const handleSelect = (date: string) => {
    onSelect(date);
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.monthNav}>
        <IconButton
          name="chevron-back"
          accessibilityLabel="Mes anterior"
          onPress={() => setMonth((current) => addMonths(current, -1))}
        />
        <Text style={[theme.typography.subheading, { color: theme.colors.text }]}>
          {monthLabelCapitalised(month)}
        </Text>
        <IconButton
          name="chevron-forward"
          accessibilityLabel="Mes siguiente"
          onPress={() => setMonth((current) => addMonths(current, 1))}
        />
      </View>

      <MonthGrid month={month} selected={value} onSelect={handleSelect} />

      <Pressable
        onPress={() => handleSelect(todayISO())}
        style={({ pressed }) => [
          styles.todayButton,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.primary }]}>
          Elegir hoy
        </Text>
      </Pressable>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  todayButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
});
