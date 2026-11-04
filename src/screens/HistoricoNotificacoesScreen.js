import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useDeleteNotification, useNotifications } from '../hooks/useNotifications';
import { useAppTheme } from '../context/ThemeProvider';
import { confirmDelete } from '../utils/confirmDelete';
import { formatDateTime, isFutureDateTime } from '../utils/date';

export default function HistoricoNotificacoesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, isError, isRefetching, refetch } = useNotifications();
  const deleteNotification = useDeleteNotification();

  const handleDelete = (id) => confirmDelete({
    title: 'Excluir notificação',
    message: 'Deseja excluir este registro do histórico?',
    errorMessage: 'Não foi possível excluir o registro.',
    onConfirm: async () => {
      await deleteNotification.mutateAsync(String(id));
    },
  });

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || `${item.createdAt || 'notification'}-${index}`}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListHeaderComponent={<HeaderSection title="Histórico de notificações" subtitle="Acompanhe os lembretes registrados pelo aplicativo" />}
        ListEmptyComponent={isError
          ? <ErrorState title="Não foi possível carregar o histórico." onRetry={refetch} />
          : !isLoading
            ? <EmptyState title="Nenhuma notificação registrada." description="Confirmações e lembretes aparecerão aqui." />
            : null}
        ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
        renderItem={({ item }) => {
          const isScheduled = isFutureDateTime(item.scheduledFor);
          return (
            <ProfileCard title={item.title || 'Notificação'} icon="🔔">
              <View style={[styles.statusBadge, isScheduled ? styles.scheduledBadge : styles.sentBadge]}>
                <Text style={[styles.statusText, isScheduled ? styles.scheduledStatusText : null]}>{isScheduled ? 'Agendada' : 'Enviada'}</Text>
              </View>
              <Text style={styles.message}>{item.message || 'Sem detalhes disponíveis.'}</Text>
              {item.createdAt ? <Text style={styles.date}>Criada em {formatDateTime(item.createdAt)}</Text> : null}
              {isScheduled ? <Text style={styles.date}>Agendada para {formatDateTime(item.scheduledFor)}</Text> : null}
              <AppButton
                title="Excluir do histórico"
                variant="outline"
                onPress={() => handleDelete(item.id)}
                disabled={!item.id || deleteNotification.isPending}
                style={styles.deleteButton}
              />
            </ProfileCard>
          );
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, flexGrow: 1 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 8 },
  scheduledBadge: { backgroundColor: colors.warning },
  sentBadge: { backgroundColor: colors.surfaceAlt },
  statusText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  scheduledStatusText: { color: colors.primaryText },
  message: { color: colors.textMuted },
  date: { color: colors.placeholder, marginTop: 8, fontSize: 12 },
  deleteButton: { marginTop: 12 },
});
