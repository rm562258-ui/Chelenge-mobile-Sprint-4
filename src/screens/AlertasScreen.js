import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useAppointmentAlerts } from '../hooks/useAppointmentAlerts';
import { useAppTheme } from '../context/ThemeProvider';

export default function AlertasScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { alertItems, data, isError, loading, refreshing, refreshAlerts, refetch } = useAppointmentAlerts();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        data={alertItems}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAlerts} />}
        ListHeaderComponent={<HeaderSection title="Alertas e recomendações" subtitle="Consultas dos próximos 7 dias e avisos gerados pelos cuidados do seu pet" />}
        ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar alertas." onRetry={refetch} /> : !loading ? <EmptyState title="Nenhum alerta no momento." description="Novos alertas aparecerão aqui." /> : null}
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
