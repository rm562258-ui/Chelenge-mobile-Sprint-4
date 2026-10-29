import { useMemo } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text } from 'react-native';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useAppointmentAlerts } from '../hooks/useAppointmentAlerts';
import { useAppTheme } from '../context/ThemeProvider';

export default function AlertasScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { alertItems, data, isError, loading, refreshAlerts, refetch } = useAppointmentAlerts();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={alertItems}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refreshAlerts} />}
        ListHeaderComponent={<HeaderSection title="Histórico de Notificações" subtitle="Acompanhe alertas gerados pelo cuidado do seu pet" />}
        ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar notificações." onRetry={refetch} /> : !loading ? <EmptyState title="Nenhuma notificação encontrada." description="Novos alertas aparecerão aqui." /> : null}
        ListFooterComponent={loading && !data ? <LoadingSkeleton rows={3} /> : null}
        keyExtractor={(item, index) => item.id?.toString() || `${item.createdAt || 'notification'}-${index}`}
        renderItem={({ item }) => (
          <ProfileCard title={item.title || 'Notificação'} icon="🔔">
            <Text style={styles.message}>{item.message || 'Sem detalhes disponíveis.'}</Text>
          </ProfileCard>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
  message: { color: colors.textMuted },
});
