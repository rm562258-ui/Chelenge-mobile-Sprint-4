import { useMemo } from 'react';
import { Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useDeleteNotification, useNotifications } from '../hooks/useNotifications';
import { useAppTheme } from '../context/ThemeProvider';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR');
};

export default function HistoricoNotificacoesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, isError, isRefetching, refetch } = useNotifications();
  const deleteNotification = useDeleteNotification();

  const notifications = useMemo(() => {
    const records = Array.isArray(data) ? [...data] : [];
    return records.sort((first, second) => {
      const firstDate = new Date(first.createdAt || 0).getTime();
      const secondDate = new Date(second.createdAt || 0).getTime();
      return secondDate - firstDate;
    });
  }, [data]);

  const handleDelete = (id) => {
    Alert.alert('Excluir notificação', 'Deseja excluir este registro do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification.mutateAsync(String(id));
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o registro.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={notifications}
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
          const scheduledAt = item.scheduledFor ? new Date(item.scheduledFor) : null;
          const isScheduled = scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now();
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
