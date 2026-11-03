import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';
import type { PetOption } from '../../hooks/usePetOptions';
import type { AppColors } from '../../theme/colors';

type PetSelectorProps = {
  label?: string;
  options: PetOption[];
  value?: string;
  onChange: (petId: string) => void;
  loading?: boolean;
  error?: string;
};

export default function PetSelector({ label = 'Pet', options, value, onChange, loading, error }: PetSelectorProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasUnknownValue = !!value && !options.some((option) => option.id === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {loading ? (
        <Text style={styles.hint}>Carregando pets...</Text>
      ) : options.length === 0 ? (
        <Text style={styles.hint}>Nenhum pet cadastrado. Cadastre um pet em Meus Pets para continuar.</Text>
      ) : (
        <View style={styles.options}>
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => onChange(option.id)}
                style={[styles.option, selected && styles.optionSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {hasUnknownValue && !loading ? <Text style={styles.hint}>O pet deste registro não foi encontrado. Selecione um pet.</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: { width: '100%', marginTop: 8 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, fontWeight: '600' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.surface },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  optionText: { color: colors.textMuted },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  hint: { color: colors.placeholder, fontSize: 12, marginTop: 4 },
  errorText: { color: colors.danger, marginTop: 6, fontSize: 12 },
});
