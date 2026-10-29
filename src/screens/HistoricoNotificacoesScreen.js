import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState } from '../components/ui/ListState';
import { useAppTheme } from '../context/ThemeProvider';

const STORAGE_KEY = '@clyvocare:notification-history';

export default function HistoricoNotificacoesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setNotifications(JSON.parse(stored));
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item.id?.toString() || `${item.createdAt || 'notification'}-${index}`}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<HeaderSection title="Histórico de notificações" subtitle="Acompanhe os lembretes registrados localmente" />}
        ListEmptyComponent={<EmptyState title="Nenhuma notificação registrada." description="Novos lembretes aparecerão aqui quando forem salvos pelo aplicativo." />}
        renderItem={({ item }) => (
          <ProfileCard title={item.title || 'Notificação'} icon="🔔">
            <Text style={styles.message}>{item.message || item.body || 'Sem detalhes disponíveis.'}</Text>
            {item.createdAt ? <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text> : null}
          </ProfileCard>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, flexGrow: 1 },
  message: { color: colors.textMuted },
  date: { color: colors.placeholder, marginTop: 8, fontSize: 12 },
});
