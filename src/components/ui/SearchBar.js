import { useMemo } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar', style }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.placeholder} style={[styles.input, style]} accessibilityLabel={placeholder} />;
}

const createStyles = (colors) => StyleSheet.create({ input: { flex: 1, backgroundColor: colors.inputBackground, paddingHorizontal: 14, height: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.border, color: colors.text } });
