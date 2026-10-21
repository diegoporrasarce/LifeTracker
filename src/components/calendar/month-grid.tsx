import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import {
  buildMonthGrid,
  dayNumber,
  isSameMonth,
  todayISO,
  WEEKDAY_INITIALS,
  type MonthKey,
} from '@/utils/date';

export interface DayMark {
  key: string;
  color: string;
}

interface MonthGridProps {
  month: MonthKey;
  selected?: string;
  onSelect?: (date: string) => void;
  /** Small dots rendered under the day number. */
  getMarks?: (date: string) => DayMark[];
  showWeekdays?: boolean;
}

export function MonthGrid({
  month,
  selected,
  onSelect,
  getMarks,
  showWeekdays = true,
}: MonthGridProps) {
  const theme = useTheme();
  const cells = buildMonthGrid(month);
  const today = todayISO();

  return (
    <View style={styles.container}>
      {showWeekdays ? (
        <View style={styles.weekRow}>
          {WEEKDAY_INITIALS.map((initial, index) => (
            <View key={initial + index} style={styles.cell}>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
                {initial}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.grid}>
        {cells.map((date) => {
          const inMonth = isSameMonth(date, month);
          const isToday = date === today;
          const isSelected = date === selected;
          const marks = getMarks?.(date) ?? [];

          return (
            <View key={date} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={date}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect?.(date)}
                style={({ pressed }) => [
                  styles.day,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : isToday
                        ? theme.colors.primarySoft
                        : 'transparent',
                    borderRadius: theme.radius.sm,
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}>
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: isSelected
                        ? theme.colors.onPrimary
                        : inMonth
                          ? theme.colors.text
                          : theme.colors.textTertiary,
                      fontWeight: isToday || isSelected ? '700' : '400',
                    },
                  ]}>
                  {dayNumber(date)}
                </Text>
              </Pressable>

              <View style={styles.marks}>
                {marks.slice(0, 3).map((mark) => (
                  <View
                    key={mark.key}
                    style={[
                      styles.mark,
                      { backgroundColor: isSelected ? theme.colors.onPrimary : mark.color },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 2,
    gap: 3,
  },
  day: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marks: {
    flexDirection: 'row',
    gap: 3,
    height: 5,
    alignItems: 'center',
  },
  mark: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
