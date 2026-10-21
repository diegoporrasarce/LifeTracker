import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { CalendarEvent } from '@/store/types';

interface EventItemProps {
  event: CalendarEvent;
  onPress: () => void;
  onToggle?: () => void;
}

export function EventItem({ event, onPress, onToggle }: EventItemProps) {
  const theme = useTheme();
  const done = event.kind === 'done';
  const accent = done ? theme.colors.success : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      {onToggle ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={done ? 'Marcar como pendiente' : 'Marcar como hecho'}
          hitSlop={10}
          onPress={onToggle}
          style={[
            styles.checkbox,
            {
              borderColor: done ? theme.colors.success : theme.colors.borderStrong,
              backgroundColor: done ? theme.colors.success : 'transparent',
            },
          ]}>
          {done ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        </Pressable>
      ) : (
        <View style={[styles.dot, { backgroundColor: accent }]} />
      )}

      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[
            theme.typography.body,
            {
              color: done ? theme.colors.textSecondary : theme.colors.text,
              textDecorationLine: done ? 'line-through' : 'none',
            },
          ]}>
          {event.title}
        </Text>

        {event.notes ? (
          <Text
            numberOfLines={2}
            style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {event.notes}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons
              name={done ? 'checkmark-circle-outline' : 'ellipse-outline'}
              size={13}
              color={accent}
            />
            <Text style={[theme.typography.micro, { color: theme.colors.textSecondary }]}>
              {done ? 'Hecho' : 'Me toca'}
            </Text>
          </View>
          {event.time ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
              <Text style={[theme.typography.micro, { color: theme.colors.textSecondary }]}>
                {event.time}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
