import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';
import type { AppColors } from '../../theme/colors';

export type QuickAction = {
  label: string;
  icon: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type QuickActionsProps = {
  title?: string;
  actions: QuickAction[];
  columns?: number;
};

// Grade de atalhos: no lugar de uma lista longa de botões, as opções cabem na tela sem rolar.
export default function QuickActions({ title, actions, columns = 3 }: QuickActionsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tileWidth = `${(100 - (columns - 1) * 2) / columns}%` as const;
  // Espaços vazios completam a última linha para todos os atalhos terem o mesmo tamanho.
  const fillers = (columns - (actions.length % columns)) % columns;

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[styles.tile, { width: tileWidth }, action.disabled && styles.disabled]}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={[styles.label, action.tone === 'danger' && styles.danger]} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
        {Array.from({ length: fillers }, (_, index) => (
          <View key={`filler-${index}`} style={{ width: tileWidth }} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: { width: '100%', marginTop: 4 },
  title: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  tile: {
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  icon: { fontSize: 20 },
  label: { color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  danger: { color: colors.danger },
  disabled: { opacity: 0.5 },
});
