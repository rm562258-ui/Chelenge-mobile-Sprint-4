import { useMemo } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import SearchBar from '../components/ui/SearchBar';
import { useAppointments } from '../hooks/useAppointments';
import { useFilteredAppointments } from '../hooks/useFilteredAppointments';
import { formatDisplayDate } from '../utils/date';
import { useAppTheme } from '../context/ThemeProvider';
import { APPOINTMENT_REMINDER_LABELS } from '../constants/appointments';

export default function AgendaCuidadosScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, isError, refetch } = useAppointments();
  const { items, query, setQuery, status, toggleStatus } = useFilteredAppointments(Array.isArray(data) ? data : []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={items}
        refreshControl={<RefreshControl refreshing={isLoading && !!data} onRefresh={refetch} />}
        ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar agenda." onRetry={refetch} /> : !isLoading ? <EmptyState title="Nenhuma consulta encontrada." description="Agende uma consulta ou ajuste sua busca." /> : null}
        ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
        keyExtractor={(item, index) => item.id?.toString() || `${item.date || 'consulta'}-${index}`}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => (
          <View>
            <HeaderSection title="Agenda de Cuidados" subtitle="Próximos compromissos e lembretes" />
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <AppButton title="Novo" onPress={() => navigation.navigate('AppointmentForm')} />
            </View>
            <View style={styles.controls}>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar consulta" />
              <AppButton title={status ? 'Todas' : 'Pendentes'} variant="outline" onPress={toggleStatus} />
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AppointmentDetails', { id: item.id })}>
            <ProfileCard title={`${item.type || item.title || 'Consulta'} - ${item.petName || 'Pet'}`} icon={'📌'}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.type || 'Consulta'} • {item.status || '-'}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Pet: {item.petName || '-'}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Data: {formatDisplayDate(item.date)}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Horário: {item.time || 'Não informado'}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Lembrete: {APPOINTMENT_REMINDER_LABELS[item.reminder] || 'Sem lembrete'}</Text>
            </ProfileCard>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
});
