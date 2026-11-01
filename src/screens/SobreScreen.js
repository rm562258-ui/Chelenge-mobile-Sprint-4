import { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import DevCard from '../components/ui/DevCard';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { TEAM_MEMBERS } from '../constants/team';
import { useAppTheme } from '../context/ThemeProvider';
import { buildInfo } from '../config/buildInfo';

const formatBuildDate = (value) => {
  if (!value || value === 'Indisponível') return 'Indisponível';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Indisponível' : date.toLocaleString('pt-BR');
};

export default function SobreScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderSection title="Sobre o App" subtitle="Informações desta versão do ClyvoCare Pet" />

        <ProfileCard title="Aplicativo" icon="🐾">
          <Text style={styles.appName}>{buildInfo.appName}</Text>
          <Text style={styles.detail}>Versão: {buildInfo.version}</Text>
          <Text style={styles.detail}>Repositório: Chelenge-mobile-Sprint-3</Text>
          <Text style={styles.detail}>Host da API: {buildInfo.apiHost}</Text>
          <Text style={styles.detail}>Build em: {formatBuildDate(buildInfo.builtAt)}</Text>
        </ProfileCard>

        <ProfileCard title="Identificação da versão" icon="🔖">
          {buildInfo.commitHash === 'desconhecido' ? (
            <Text style={styles.warning}>Hash indisponível nesta build</Text>
          ) : null}
          <Text style={styles.hashLabel}>Hash completo</Text>
          <View style={styles.hashContainer}>
            <Text selectable style={styles.hash}>{buildInfo.commitHash}</Text>
          </View>
          <Text style={styles.hashLabel}>Hash curto</Text>
          <Text selectable style={styles.shortHash}>{buildInfo.commitShort}</Text>
        </ProfileCard>

        <ProfileCard title="Integrantes" icon="👥">
          {TEAM_MEMBERS.map((member) => (
            <DevCard key={member.rm} photo={member.photo} name={member.name} rm={member.rm} />
          ))}
        </ProfileCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 32 },
  appName: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  detail: { color: colors.textMuted, marginTop: 6 },
  warning: { color: colors.warning, fontWeight: '700', marginBottom: 12 },
  hashLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  hashContainer: { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12 },
  hash: { color: colors.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  shortHash: { color: colors.primary, fontFamily: 'monospace', fontSize: 16, fontWeight: '800' },
});
