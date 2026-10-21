import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  /** Rendered above the scrollable area and kept in place. */
  header?: ReactNode;
  /** Use a plain view instead of a scroll view. */
  scroll?: boolean;
  contentStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
  /**
   * `tabs` applies the top safe area inset (the native tab layout has no
   * header), `stack` assumes the native stack header already took care of it.
   */
  variant?: 'tabs' | 'stack';
  /** Extra space kept below the last element. */
  bottomSpacing?: number;
}

/**
 * Common screen shell.
 *
 * Scroll view automatic inset adjustment is disabled on purpose: the safe
 * areas are applied explicitly here so the behaviour is identical on iOS and
 * Android and the header never sits under the status bar.
 */
export function Screen({
  children,
  header,
  scroll = true,
  contentStyle,
  scrollProps,
  variant = 'tabs',
  bottomSpacing = 32,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bottomInset = variant === 'tabs' ? 0 : insets.bottom;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        {
          paddingHorizontal: theme.spacing.md,
          paddingBottom: bottomInset + bottomSpacing,
        },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={variant === 'tabs' ? ['top'] : []}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {header ? (
        <View style={{ paddingHorizontal: theme.spacing.md }}>{header}</View>
      ) : null}
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
