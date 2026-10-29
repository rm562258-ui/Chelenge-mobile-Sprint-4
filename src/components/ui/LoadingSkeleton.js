import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';

export default function LoadingSkeleton({ rows = 3 }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container} accessibilityLabel="Carregando">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.title} />
          <View style={styles.line} />
          <View style={styles.shortLine} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  title: { height: 18, width: '48%', backgroundColor: colors.skeleton, borderRadius: 8, marginBottom: 14 },
  line: { height: 12, width: '88%', backgroundColor: colors.surfaceAlt, borderRadius: 8, marginBottom: 8 },
  shortLine: { height: 12, width: '62%', backgroundColor: colors.surfaceAlt, borderRadius: 8 },
});
