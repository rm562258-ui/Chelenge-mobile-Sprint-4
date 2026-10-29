import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeProvider';
import { subscribeNetworkStatus } from '../../utils/networkStatus';

export default function OfflineBanner() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [offline, setOffline] = useState(false);

  useEffect(() => subscribeNetworkStatus(setOffline), []);

  if (!offline) return null;
  return <View style={styles.banner}><Text style={styles.text}>Você está offline. Algumas ações podem ficar indisponíveis.</Text></View>;
}

const createStyles = (colors) => StyleSheet.create({ banner: { position: 'absolute', top: 0, left: 0, right: 0, padding: 10, backgroundColor: colors.warning, zIndex: 20 }, text: { color: colors.primaryText, textAlign: 'center', fontWeight: '700' } });
