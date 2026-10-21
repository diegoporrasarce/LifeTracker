import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { useTheme } from '@/hooks/use-theme';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom sheet used for every "add / edit" form in the app. */
export function ModalSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.isDark ? '#000000AA' : '#10182866' }]}
          onPress={onClose}
          accessibilityLabel="Cerrar"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom, theme.spacing.md),
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />

          <View style={[styles.header, { paddingHorizontal: theme.spacing.md }]}>
            <View style={styles.headerText}>
              <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{title}</Text>
              {subtitle ? (
                <Text
                  style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <IconButton
              name="close"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              color={theme.colors.textSecondary}
            />
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {footer ? (
            <View
              style={[
                styles.footer,
                {
                  paddingHorizontal: theme.spacing.md,
                  paddingTop: theme.spacing.sm,
                  borderTopColor: theme.colors.border,
                },
              ]}>
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    maxHeight: '90%',
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  body: {
    flexGrow: 0,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
