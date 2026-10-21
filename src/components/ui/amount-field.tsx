import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { formatAmountForInput, parseAmount } from '@/utils/format';

interface AmountFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}

/**
 * Numeric field for money amounts. The raw text is kept while typing so the
 * user can type `12,` without the value being rewritten under the cursor.
 */
export function AmountField({
  label,
  value,
  onChange,
  placeholder = '0,00',
  hint,
  autoFocus,
}: AmountFieldProps) {
  const theme = useTheme();
  const [text, setText] = useState(() => formatAmountForInput(value));
  const [focused, setFocused] = useState(false);

  // The parent may load a different amount (a new form, another record).
  // While the field is focused the raw text wins, otherwise it is refreshed.
  useEffect(() => {
    if (focused) return;
    setText(formatAmountForInput(value));
  }, [value, focused]);

  const handleChange = (next: string) => {
    setText(next);
    onChange(parseAmount(next));
  };

  const handleBlur = () => {
    setFocused(false);
    const normalised = formatAmountForInput(parseAmount(text));
    setText(normalised);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border,
          },
        ]}>
        <TextInput
          value={text}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          returnKeyType="done"
          style={[theme.typography.bodyStrong, styles.input, { color: theme.colors.text }]}
        />
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textSecondary }]}>€</Text>
      </View>
      {hint ? (
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
});
