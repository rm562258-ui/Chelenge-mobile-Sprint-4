import { useContext, useMemo } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from '../components/ui/AppButton';
import ProfileCard from '../components/ui/ProfileCard';
import { UserContext } from "../context/UserContext";
import { useCareProfile } from '../hooks/useCareProfile';
import { useDeletePet, usePets } from '../hooks/usePets';
import { useAppTheme } from '../context/ThemeProvider';


export default function PagPerfil({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, clearUser } = useContext(UserContext);
  const { data: pets = [], isLoading: isPetsLoading } = usePets();
  const deletePetMutation = useDeletePet();
  const { referenceClinic, nextCare } = useCareProfile();

  const handleDeletePet = (pet) => {
    const petName = pet.petNome || pet.name || 'Pet sem nome';

    Alert.alert('Confirmar exclusão', `Deseja apagar ${petName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePetMutation.mutateAsync(String(pet.id));
          } catch {
            Alert.alert('Erro', 'Não foi possível apagar este pet.');
          }
        },
      },
    ]);
  };

  // A exclusão de cada pet fica no próprio card: o Alert do Android mostra no máximo 3 botões.
  const handleClear = () => {
    Alert.alert('Confirmar', 'Deseja limpar as preferências do perfil salvas neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'OK', onPress: async () => { if (clearUser) await clearUser(); } },
    ]);
  };

  const registeredPets = Array.isArray(pets) ? pets : [];
  const empty = registeredPets.length === 0 && (!user || !user.petNome);
  const mainPet = registeredPets[0];

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.headerColor} />
          <View style={styles.avatarWrap}>
            {user?.foto ? (
              <Image source={{ uri: user.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 56 }}>🐾</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.name}>{mainPet?.petNome || mainPet?.name || user?.petNome || (isPetsLoading ? 'Carregando pet...' : 'Nenhum pet cadastrado')}</Text>
          <View style={{ height: 8 }} />

          {isPetsLoading && registeredPets.length === 0 ? (
            <ProfileCard title="Carregando pets" icon="🐾">
              <Text style={{ color: colors.text }}>Buscando os pets cadastrados...</Text>
            </ProfileCard>
          ) : empty ? (
            <ProfileCard title="Sem cadastro" icon="ℹ️">
              <Text style={{ color: colors.text }}>Não há perfil de pet salvo. Vá para Cadastro para registrar um pet.</Text>
              <View style={{ height: 8 }} />
              <AppButton title="Cadastrar Pet" onPress={() => navigation.navigate('CadastroPet')} />
            </ProfileCard>
          ) : (
            <>
              {registeredPets.map((pet) => (
                <ProfileCard key={pet.id} title="Dados do Pet" icon="🐾">
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{pet.petNome || pet.name || 'Pet sem nome'}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>{pet.especie || pet.type || '-'} • {pet.raca || pet.breed || '-'}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>Idade: {pet.idade || pet.age || '-'} • Peso: {(pet.peso || pet.weight) ? `${pet.peso || pet.weight} kg` : '-'}</Text>
                  <Text style={{ color: pet.pendingSync ? colors.placeholder : colors.success, fontSize: 12, fontWeight: '700', marginTop: 8 }}>
                    {pet.pendingSync ? 'Salvo offline' : 'Sincronizado'}
                  </Text>
                  <View style={{ height: 8 }} />
                  <AppButton title="Editar pet" onPress={() => navigation.navigate('CadastroPet', { id: pet.id })} variant="outline" />
                  <View style={{ height: 8 }} />
                  <AppButton title="Excluir pet" onPress={() => handleDeletePet(pet)} variant="outline" disabled={deletePetMutation.isPending} />
                </ProfileCard>
              ))}

              {!registeredPets.length && user?.petNome ? (
                <ProfileCard title="Dados do Pet" icon="🐾">
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{user.petNome}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>{user.especie} • {user.raca}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>Idade: {user.idade || '-'} • Peso: {user.peso ? `${user.peso} kg` : '-'}</Text>
                </ProfileCard>
              ) : null}

              <ProfileCard title="Clínica de Referência" icon="🏥">
                <Text style={{ color: colors.text, fontWeight: '600' }}>{user.clinica || referenceClinic || 'Nenhuma clínica informada nas consultas'}</Text>
              </ProfileCard>

              <ProfileCard title="Cuidado Principal" icon="⚕️">
                <Text style={{ color: colors.text, fontWeight: '600' }}>{user.cuidadoPrincipal || nextCare || 'Nenhum cuidado agendado'}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 6 }}>{user.lembretesAtivos ? 'Lembretes ativos' : 'Lembretes desativados'}</Text>
              </ProfileCard>

              <View style={{ height: 8 }} />
              <AppButton title="Agenda de Cuidados" onPress={() => navigation.navigate('AgendaCuidados')} variant="outline" style={{ marginBottom: 12 }} icon="📅" />
              <AppButton title="Alertas e Recomendações" onPress={() => navigation.navigate('Alertas')} variant="outline" style={{ marginBottom: 12 }} icon="⚠️" />
              <AppButton title="Histórico de notificações" onPress={() => navigation.navigate('HistoricoNotificacoes')} variant="outline" style={{ marginBottom: 12 }} icon="🔔" />
              <AppButton title="Configurações" onPress={() => navigation.navigate('Configuracoes')} variant="outline" style={{ marginBottom: 12 }} icon="⚙️" />
              <AppButton title="Limpar dados" onPress={handleClear} variant="outline" icon="🗑️" />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 0 },
  headerBlock: { height: 200, position: 'relative' },
  headerColor: { backgroundColor: colors.accent, height: '100%' },
  avatarWrap: { position: 'absolute', left: 0, right: 0, top: 120, alignItems: 'center' },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: colors.surface },
  placeholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  mainContent: { padding: 16, marginTop: 36 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
