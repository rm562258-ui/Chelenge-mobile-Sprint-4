import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';

export default function DevCard({ photo, name, rm, role = 'Desenvolvedor', style }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.card, style]}>
      {photo ? <Image source={photo} style={styles.photo} /> : <View style={styles.placeholder} />}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>RM: {rm}</Text>
        <Text style={styles.meta}>{role}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: colors.text,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  photo: { width: 56, height: 56, borderRadius: 12 },
  placeholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  info: { marginLeft: 12, flex: 1 },
  name: { fontWeight: '700', color: colors.text },
  meta: { color: colors.textMuted, marginTop: 2 },
});
