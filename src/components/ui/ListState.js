import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';
import AppButton from './AppButton';

export function EmptyState({ title = 'Nenhum registro encontrado.', description = 'Quando houver dados, eles aparecerão aqui.' }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.container}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>;
}

export function ErrorState({ title = 'Não foi possível carregar os dados.', onRetry }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.container}><Text style={styles.errorTitle}>{title}</Text><Text style={styles.description}>Verifique sua conexão e tente novamente.</Text><AppButton title="Tentar novamente" variant="outline" onPress={onRetry} style={styles.button} /></View>;
}

const createStyles = (colors) => StyleSheet.create({
  container: { alignItems: 'center', padding: 28 },
  title: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  errorTitle: { color: colors.danger, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  description: { color: colors.placeholder, marginTop: 8, textAlign: 'center' },
  button: { marginTop: 16 },
});
