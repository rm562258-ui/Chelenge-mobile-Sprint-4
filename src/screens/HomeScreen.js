import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
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
            <TouchableOpacity onPress={() => navigation.navigate('AppointmentDetails', { id: summary.nextAppointment.id })} accessibilityRole="button">
              <Text style={styles.itemTitle}>{summary.nextAppointment.type || 'Consulta'} • {summary.nextAppointment.petName || 'Pet'}</Text>
              <Text style={styles.itemDetail}>
                {formatDisplayDate(summary.nextAppointment.date)}{summary.nextAppointment.time ? ` às ${summary.nextAppointment.time}` : ''}
              </Text>
              {summary.nextAppointment.isOverdue ? (
                <Text style={styles.overdue}>O horário já passou: toque para marcar como concluída.</Text>
              ) : null}
              <Text style={styles.link}>Ver detalhes ›</Text>
            </TouchableOpacity>
          ) : (
            <>
              <EmptyState title="Nenhuma consulta pendente." description="Agende uma consulta para acompanhar o próximo cuidado." />
              <AppButton title="Agendar consulta" onPress={() => navigation.navigate('AppointmentForm')} />
            </>
          )}
        </ProfileCard>

        <ProfileCard title="Próximo reforço de vacina" icon="💉">
          {summary.vaccinesQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.vaccinesQuery.isError ? (
            <ErrorState title="Não foi possível carregar as vacinas." onRetry={summary.vaccinesQuery.refetch} />
          ) : summary.nextVaccine ? (
            <TouchableOpacity onPress={() => navigation.navigate('VaccineDetails', { id: summary.nextVaccine.id })} accessibilityRole="button">
              <Text style={styles.itemTitle}>
                {summary.nextVaccine.name || 'Vacina'}{summary.nextVaccine.petName ? ` • ${summary.nextVaccine.petName}` : ''}
              </Text>
              <Text style={styles.itemDetail}>
                {summary.nextVaccine.isOverdue ? 'Reforço vencido desde' : 'Reforço em'} {formatDisplayDate(summary.nextVaccine.dueDate)}
              </Text>
              {summary.nextVaccine.isOverdue ? (
                <Text style={styles.overdue}>Agende o reforço com o veterinário.</Text>
              ) : null}
              <Text style={styles.link}>Ver detalhes ›</Text>
            </TouchableOpacity>
          ) : (
            <>
              <EmptyState title="Nenhum reforço registrado." description="Registre a data do próximo reforço na carteira vacinal." />
              <AppButton title="Registrar vacina" onPress={() => navigation.navigate('VaccineForm')} />
            </>
          )}
        </ProfileCard>

        <ProfileCard title="Medicamentos em andamento" icon="💊">
          {summary.medicationsQuery.isLoading ? <LoadingSkeleton rows={1} /> : summary.medicationsQuery.isError ? (
            <ErrorState title="Não foi possível carregar os medicamentos." onRetry={summary.medicationsQuery.refetch} />
          ) : summary.nextMedication ? (
            <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { id: summary.nextMedication.id })} accessibilityRole="button">
              <Text style={styles.itemTitle}>
                {summary.nextMedication.name || 'Medicamento'}{summary.nextMedication.petName ? ` • ${summary.nextMedication.petName}` : ''}
              </Text>
              {summary.nextMedication.dosage || summary.nextMedication.frequency ? (
                <Text style={styles.itemDetail}>
                  {[summary.nextMedication.dosage, summary.nextMedication.frequency].filter(Boolean).join(' • ')}
                </Text>
              ) : null}
              <Text style={styles.itemDetail}>
                {summary.nextMedication.startsLater
                  ? `Começa em ${formatDisplayDate(summary.nextMedication.startDate)}`
                  : summary.nextMedication.endDate ? `Até ${formatDisplayDate(summary.nextMedication.endDate)}` : 'Uso contínuo'}
              </Text>
              {summary.medicationsInProgress > 1 ? (
                <Text style={styles.itemDetail}>+{summary.medicationsInProgress - 1} em andamento</Text>
              ) : null}
              <Text style={styles.link}>Ver detalhes ›</Text>
            </TouchableOpacity>
          ) : (
            <>
              <EmptyState title="Nenhum medicamento em andamento." description="Cadastre um tratamento para acompanhar seu pet." />
              <AppButton title="Registrar medicamento" onPress={() => navigation.navigate('MedicationForm')} />
            </>
          )}
        </ProfileCard>

        <View style={{ height: 8 }} />
        <AppButton title="Cadastrar Pet" onPress={() => navigation.navigate('CadastroPet')} style={{ marginBottom: 8 }} />
        <AppButton title="Meus Pets" onPress={() => navigation.navigate('Pets')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Ver Perfil do Pet" onPress={() => navigation.navigate('PerfilPet')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Agenda de Cuidados" onPress={() => navigation.navigate('AgendaCuidados')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Carteira Vacinal" onPress={() => navigation.navigate('Vaccines')} variant="outline" style={{ marginBottom: 8 }} />
        <AppButton title="Medicamentos" onPress={() => navigation.navigate('Medications')} variant="outline" style={{ marginBottom: 8 }} />
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
  itemTitle: { color: colors.text, fontWeight: '600' },
  itemDetail: { color: colors.textMuted, marginTop: 6 },
  overdue: { color: colors.warning, fontWeight: '600', marginTop: 6 },
  link: { color: colors.primary, fontWeight: '700', marginTop: 8 },
});
