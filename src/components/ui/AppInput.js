import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';

export default function AppInput({ label, value, onChangeText, placeholder, leftIcon, rightElement, keyboardType, secureTextEntry, style, error }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        {leftIcon ? <Text style={styles.leftIcon}>{leftIcon}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
        />
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: { width: '100%', marginTop: 8 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    borderRadius: 18,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftIcon: { marginRight: 8, fontSize: 18 },
  input: { flex: 1, color: colors.text },
  right: { marginLeft: 8 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, marginTop: 6, fontSize: 12 },
});
