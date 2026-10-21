import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
}

export function TextField({ label, hint, multiline, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        multiline={multiline}
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          theme.typography.body,
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border,
            minHeight: multiline ? 92 : 46,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        {...inputProps}
      />
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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
