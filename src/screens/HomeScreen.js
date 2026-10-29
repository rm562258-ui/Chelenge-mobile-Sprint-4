import { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../context/ThemeProvider';

export default function HomeScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, loading } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderSection title="ClyvoCare Pet" subtitle="Ajuda tutores a manterem a continuidade do cuidado do seu pet" />

        <ProfileCard title="Próxima vacina" icon="💉">
          <Text style={{ color: colors.text, fontWeight: '600' }}>Vacina antirrábica</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>Data estimada: 2026-08-10</Text>
        </ProfileCard>

        <ProfileCard title="Check-up recomendado" icon="🩺">
          <Text style={{ color: colors.text, fontWeight: '600' }}>Consulta anual preventiva</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>Recomendação: agendar nos próximos 30 dias</Text>
        </ProfileCard>

        <ProfileCard title="Acompanhamento contínuo" icon="📈">
          <Text style={{ color: colors.text, fontWeight: '600' }}>Medicação e monitoramento</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>Mantenha o histórico clínico e lembretes ativos</Text>
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
