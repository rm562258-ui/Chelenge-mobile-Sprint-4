import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';
import type { AppColors } from '../../theme/colors';

type SummaryTileProps = {
  title: string;
  icon: string;
  onPress?: () => void;
  children: ReactNode;
};

// Caixa compacta do resumo da Home: duas por linha.
export default function SummaryTile({ title, icon, onPress, children }: SummaryTileProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  tile: {
    width: '48.5%',
    minHeight: 112,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 16, marginRight: 6 },
  title: { flex: 1, color: colors.textMuted, fontSize: 12, fontWeight: '700' },
});
