import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderSection from '../components/ui/HeaderSection';
import QuickActions from '../components/ui/QuickActions';
import SummaryTile from '../components/ui/SummaryTile';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';
import { useHomeSummary } from '../hooks/useHomeSummary';
import { formatDisplayDate } from '../utils/date';

// Conteúdo comum das caixas do resumo: carregando, erro, vazio ou o item mais próximo.
function TileContent({ query, isEmpty, emptyText, emptyAction, styles, colors, children }) {
  if (query.isLoading) return <ActivityIndicator size="small" color={colors.primary} style={styles.tileLoading} />;
  if (query.isError) {
    return (
      <>
        <Text style={styles.tileError}>Erro ao carregar.</Text>
        <Text style={styles.tileLink}>Tentar de novo ›</Text>
      </>
    );
  }
  if (isEmpty) {
    return (
      <>
        <Text style={styles.tileMuted}>{emptyText}</Text>
        <Text style={styles.tileLink}>{emptyAction} ›</Text>
      </>
    );
  }
  return children;
}

// Ao tocar na caixa: tenta de novo se deu erro, abre o cadastro se está vazia ou abre o item mais próximo.
const tilePress = (query, isEmpty, openItem, openForm) => {
  if (query.isLoading) return undefined;
  if (query.isError) return () => query.refetch();
  return isEmpty ? openForm : openItem;
};

export default function HomeScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, loading } = useAuth();
  const summary = useHomeSummary();
  const { nextAppointment, nextVaccine, nextMedication } = summary;
  const refreshing = [summary.petsQuery, summary.appointmentsQuery, summary.vaccinesQuery, summary.medicationsQuery]
    .some((query) => query.isFetching);

  const shortcuts = [
    { label: 'Meus Pets', icon: '🐾', onPress: () => navigation.navigate('Pets') },
    { label: 'Perfil do Pet', icon: '🐶', onPress: () => navigation.navigate('PerfilPet') },
    { label: 'Agenda', icon: '📅', onPress: () => navigation.navigate('AgendaCuidados') },
    { label: 'Vacinas', icon: '💉', onPress: () => navigation.navigate('Vaccines') },
    { label: 'Medicamentos', icon: '💊', onPress: () => navigation.navigate('Medications') },
    { label: 'Alertas', icon: '⚠️', onPress: () => navigation.navigate('Alertas') },
    { label: 'Notificações', icon: '🔔', onPress: () => navigation.navigate('HistoricoNotificacoes') },
    { label: 'FAQ', icon: '❔', onPress: () => navigation.navigate('IaVeterinaria') },
    { label: 'Integrantes', icon: '👥', onPress: () => navigation.navigate('Equipe') },
    { label: 'Configurações', icon: '⚙️', onPress: () => navigation.navigate('Configuracoes') },
    { label: 'Sobre o App', icon: 'ℹ️', onPress: () => navigation.navigate('Sobre') },
    {
      label: loading ? 'Saindo...' : 'Sair',
      icon: '🚪',
      tone: 'danger',
      disabled: loading,
      // O AuthContext já informa o erro ao usuário.
      onPress: () => { void logout().catch(() => undefined); },
    },
  ];

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={summary.refetchAll} />}
      >
        <HeaderSection
          title={summary.tutorName ? `Olá, ${summary.tutorName.split(' ')[0]}` : 'Olá!'}
          subtitle="Acompanhe os cuidados do seu pet"
        />

        <View style={styles.summaryGrid}>
          <SummaryTile
            title="Meus pets"
            icon="🐾"
            onPress={tilePress(summary.petsQuery, summary.petsCount === 0, () => navigation.navigate('Pets'), () => navigation.navigate('CadastroPet'))}
          >
            <TileContent query={summary.petsQuery} isEmpty={summary.petsCount === 0} emptyText="Nenhum pet cadastrado." emptyAction="Cadastrar" styles={styles} colors={colors}>
              <Text style={styles.tileValue}>{summary.petsCount}</Text>
              <Text style={styles.tileMuted}>{summary.petsCount === 1 ? 'pet cadastrado' : 'pets cadastrados'}</Text>
              <Text style={styles.tileLink}>Ver pets ›</Text>
            </TileContent>
          </SummaryTile>

          <SummaryTile
            title="Próxima consulta"
            icon="📅"
            onPress={tilePress(summary.appointmentsQuery, !nextAppointment, () => navigation.navigate('AppointmentDetails', { id: nextAppointment.id }), () => navigation.navigate('AppointmentForm'))}
          >
            <TileContent query={summary.appointmentsQuery} isEmpty={!nextAppointment} emptyText="Nenhuma consulta pendente." emptyAction="Agendar" styles={styles} colors={colors}>
              {nextAppointment ? (
                <>
                  <Text style={styles.tileStrong} numberOfLines={1}>{nextAppointment.type || 'Consulta'} • {nextAppointment.petName || 'Pet'}</Text>
                  <Text style={styles.tileMuted}>
                    {formatDisplayDate(nextAppointment.date)}{nextAppointment.time ? ` às ${nextAppointment.time}` : ''}
                  </Text>
                  {nextAppointment.isOverdue ? <Text style={styles.tileWarning}>Horário já passou</Text> : null}
                </>
              ) : null}
            </TileContent>
          </SummaryTile>

          <SummaryTile
            title="Próximo reforço"
            icon="💉"
            onPress={tilePress(summary.vaccinesQuery, !nextVaccine, () => navigation.navigate('VaccineDetails', { id: nextVaccine.id }), () => navigation.navigate('VaccineForm'))}
          >
            <TileContent query={summary.vaccinesQuery} isEmpty={!nextVaccine} emptyText="Nenhum reforço registrado." emptyAction="Registrar" styles={styles} colors={colors}>
              {nextVaccine ? (
                <>
                  <Text style={styles.tileStrong} numberOfLines={1}>{nextVaccine.name || 'Vacina'}</Text>
                  {nextVaccine.petName ? <Text style={styles.tileMuted} numberOfLines={1}>{nextVaccine.petName}</Text> : null}
                  <Text style={nextVaccine.isOverdue ? styles.tileWarning : styles.tileMuted}>
                    {nextVaccine.isOverdue ? 'Vencido em' : 'Em'} {formatDisplayDate(nextVaccine.dueDate)}
                  </Text>
                </>
              ) : null}
            </TileContent>
          </SummaryTile>

          <SummaryTile
            title="Medicamentos"
            icon="💊"
            onPress={tilePress(summary.medicationsQuery, !nextMedication, () => navigation.navigate('MedicationDetails', { id: nextMedication.id }), () => navigation.navigate('MedicationForm'))}
          >
            <TileContent query={summary.medicationsQuery} isEmpty={!nextMedication} emptyText="Nenhum em andamento." emptyAction="Registrar" styles={styles} colors={colors}>
              {nextMedication ? (
                <>
                  <Text style={styles.tileStrong} numberOfLines={1}>{nextMedication.name || 'Medicamento'}</Text>
                  <Text style={styles.tileMuted} numberOfLines={1}>
                    {[nextMedication.petName, nextMedication.dosage].filter(Boolean).join(' • ') || 'Dosagem não informada'}
                  </Text>
                  <Text style={styles.tileMuted}>
                    {nextMedication.startsLater
                      ? `Começa em ${formatDisplayDate(nextMedication.startDate)}`
                      : nextMedication.endDate ? `Até ${formatDisplayDate(nextMedication.endDate)}` : 'Uso contínuo'}
                  </Text>
                  {summary.medicationsInProgress > 1 ? (
                    <Text style={styles.tileLink}>+{summary.medicationsInProgress - 1} em andamento</Text>
                  ) : null}
                </>
              ) : null}
            </TileContent>
          </SummaryTile>
        </View>

        <QuickActions title="Acesso rápido" actions={shortcuts} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingTop: 4 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 12 },
  tileLoading: { alignSelf: 'flex-start', marginTop: 8 },
  tileValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  tileStrong: { color: colors.text, fontWeight: '700' },
  tileMuted: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  tileWarning: { color: colors.warning, fontSize: 12, fontWeight: '700', marginTop: 4 },
  tileError: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  tileLink: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 6 },
});
