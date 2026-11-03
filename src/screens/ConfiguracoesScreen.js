import { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppTheme } from '../context/ThemeProvider';
import { useAuth } from '../hooks/useAuth';
import { useReminderSettings } from '../hooks/useReminderSettings';
import { showToast } from '../utils/toast';

const themeOptions = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
];

export default function ConfiguracoesScreen({ navigation }) {
  const { colors, mode, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, loading } = useAuth();
  const { enabled: remindersEnabled, setRemindersEnabled } = useReminderSettings();

  const toggleReminders = async (nextEnabled) => {
    try {
      const updated = await setRemindersEnabled(nextEnabled);
      if (updated) showToast(nextEnabled ? 'Lembretes ativados.' : 'Lembretes desativados.', 'success');
    } catch {
      showToast('Não foi possível atualizar os lembretes.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showToast('Não foi possível encerrar a sessão.', 'error');
    }
  };

  const handleThemeChange = async (nextMode) => {
    try {
      await setMode(nextMode);
    } catch {
      showToast('Não foi possível salvar a aparência selecionada.', 'error');
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderSection title="Configurações" subtitle="Ajuste as preferências do aplicativo" />
        <ProfileCard title="Preferências" icon="⚙️">
          <View style={styles.settingRow}>
            <View style={styles.settingText}><Text style={styles.title}>Lembretes de cuidado</Text><Text style={styles.description}>Receber lembretes sobre a rotina do pet</Text></View>
            <Switch value={remindersEnabled} onValueChange={toggleReminders} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.surface} />
          </View>
        </ProfileCard>
        <ProfileCard title="Aparência" icon="🎨">
          {themeOptions.map((option) => {
            const selected = mode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => handleThemeChange(option.value)}
                style={styles.themeOption}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.title}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ProfileCard>
        <AppButton title="Meu perfil" variant="outline" onPress={() => navigation.navigate('PerfilPet')} style={styles.button} />
        <AppButton title="Histórico de notificações" variant="outline" onPress={() => navigation.navigate('HistoricoNotificacoes')} style={styles.button} />
        <AppButton title="Sobre o App" variant="outline" onPress={() => navigation.navigate('Sobre')} style={styles.button} />
        <AppButton title="Sair da conta" onPress={handleLogout} loading={loading} disabled={loading} style={styles.button} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingText: { flex: 1 },
  title: { color: colors.text, fontWeight: '700' },
  description: { color: colors.placeholder, marginTop: 4 },
  button: { marginTop: 12 },
  themeOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.placeholder, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
