import { useMemo } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ProfileCard from '../components/ui/ProfileCard';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';
import { useHomeSummary } from '../hooks/useHomeSummary';
import { formatDisplayDate } from '../utils/date';

export default function HomeScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, loading } = useAuth();
  const summary = useHomeSummary();
  const refreshQueries = [
    { key: 'pets', query: summary.petsQuery },
    { key: 'appointments', query: summary.appointmentsQuery },
    { key: 'vaccines', query: summary.vaccinesQuery },
    { key: 'medications', query: summary.medicationsQuery },
  ];
  const refreshing = refreshQueries.some(({ query }) => query.isFetching);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={summary.refetchAll} />}
      >
        <HeaderSection
          title="ClyvoCare Pet"
          subtitle={summary.tutorName ? `Olá, ${summary.tutorName}` : 'Acompanhe os cuidados do seu pet'}
        />

        <ProfileCard title="Meus pets" icon="🐾">
          {summary.petsQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.petsQuery.isError ? (
            <ErrorState title="Não foi possível carregar os pets." onRetry={summary.petsQuery.refetch} />
          ) : summary.petsCount === 0 ? (
            <>
              <EmptyState title="Nenhum pet cadastrado." description="Cadastre seu primeiro pet para acompanhar os cuidados." />
              <AppButton title="Cadastrar Pet" onPress={() => navigation.navigate('CadastroPet')} />
            </>
          ) : (
            <Text style={{ color: colors.text }}>{summary.petsCount} {summary.petsCount === 1 ? 'pet cadastrado' : 'pets cadastrados'}</Text>
          )}
        </ProfileCard>

        <ProfileCard title="Próxima consulta" icon="📅">
          {summary.appointmentsQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.appointmentsQuery.isError ? (
            <ErrorState title="Não foi possível carregar as consultas." onRetry={summary.appointmentsQuery.refetch} />
          ) : summary.nextAppointment ? (
            <>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{summary.nextAppointment.type || 'Consulta'} • {summary.nextAppointment.petName || 'Pet'}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>{formatDisplayDate(summary.nextAppointment.date)} às {summary.nextAppointment.time}</Text>
            </>
          ) : (
            <>
              <EmptyState title="Nenhuma consulta futura agendada." description="Agende uma consulta para acompanhar o próximo cuidado." />
              <AppButton title="Agendar consulta" onPress={() => navigation.navigate('AppointmentForm')} />
            </>
          )}
        </ProfileCard>

        <ProfileCard title="Próximo reforço de vacina" icon="💉">
          {summary.vaccinesQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.vaccinesQuery.isError ? (
            <ErrorState title="Não foi possível carregar as vacinas." onRetry={summary.vaccinesQuery.refetch} />
          ) : summary.nextVaccine ? (
            <>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{summary.nextVaccine.name || 'Vacina'}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Data: {formatDisplayDate(summary.nextVaccine.boosterDate)}</Text>
            </>
          ) : (
            <>
              <EmptyState title="Nenhum reforço futuro registrado." description="Registre a data do próximo reforço na carteira vacinal." />
              <AppButton title="Registrar vacina" onPress={() => navigation.navigate('VaccineForm')} />
            </>
          )}
        </ProfileCard>

        <ProfileCard title="Medicamentos em andamento" icon="💊">
          {summary.medicationsQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.medicationsQuery.isError ? (
            <ErrorState title="Não foi possível carregar os medicamentos." onRetry={summary.medicationsQuery.refetch} />
          ) : summary.medicationsInProgress === 0 ? (
            <>
              <EmptyState title="Nenhum medicamento em andamento." description="Cadastre um tratamento para acompanhar seu pet." />
              <AppButton title="Registrar medicamento" onPress={() => navigation.navigate('MedicationForm')} />
            </>
          ) : (
            <Text style={{ color: colors.text }}>{summary.medicationsInProgress} {summary.medicationsInProgress === 1 ? 'medicamento em andamento' : 'medicamentos em andamento'}</Text>
          )}
        </ProfileCard>

        <View style={{ height: 8 }} />
        <AppButton title="Cadastrar Pet" onPress={() => navigation.navigate('CadastroPet')} style={{ marginBottom: 8 }} />
        <AppButton title="Ver Perfil do Pet" onPress={() => navigation.navigate('PerfilPet')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Agenda de Cuidados" onPress={() => navigation.navigate('AgendaCuidados')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="FAQ" onPress={() => navigation.navigate('IaVeterinaria')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Integrantes" onPress={() => navigation.navigate('Equipe')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Alertas e Recomendações" onPress={() => navigation.navigate('Alertas')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Histórico de notificações" onPress={() => navigation.navigate('HistoricoNotificacoes')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Configurações" onPress={() => navigation.navigate('Configuracoes')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Sair" onPress={logout} variant="outline" loading={loading} disabled={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
});
