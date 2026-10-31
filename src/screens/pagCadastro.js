import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { UserContext } from "../context/UserContext";
import { useAppTheme } from '../context/ThemeProvider';

export default function PagCadastro({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, setUser, clearUser } = useContext(UserContext);

  const [petNome, setPetNome] = useState(user?.petNome || '');
  const [especie, setEspecie] = useState(user?.especie || '');
  const [raca, setRaca] = useState(user?.raca || '');
  const [idade, setIdade] = useState(String(user?.idade || ''));
  const [peso, setPeso] = useState(String(user?.peso || ''));
  const [tutorNome, setTutorNome] = useState(user?.tutorNome || '');
  const [contatoTutor, setContatoTutor] = useState(user?.contatoTutor || '');
  const [clinica, setClinica] = useState(user?.clinica || '');
  const [cuidadoPrincipal, setCuidadoPrincipal] = useState(user?.cuidadoPrincipal || '');
  const [photoUri, setPhotoUri] = useState(user?.foto || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // sincroniza campos locais se o contexto for carregado
    setPetNome(user?.petNome || '');
    setEspecie(user?.especie || '');
    setRaca(user?.raca || '');
    setIdade(String(user?.idade || ''));
    setPeso(String(user?.peso || ''));
    setTutorNome(user?.tutorNome || '');
    setContatoTutor(user?.contatoTutor || '');
    setClinica(user?.clinica || '');
    setCuidadoPrincipal(user?.cuidadoPrincipal || '');
    setPhotoUri(user?.foto || null);
  }, [user]);

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Permissão para usar a câmera foi negada.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
      if (result.cancelled || result.canceled) return;
      const uri = result.uri || (result.assets && result.assets[0] && result.assets[0].uri);
      if (uri) setPhotoUri(uri);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleSave = async () => {
    if (!petNome || !petNome.trim()) {
      Alert.alert('Validação', 'O nome do pet é obrigatório.');
      return;
    }
    const payload = {
      petNome: petNome.trim(),
      especie: especie.trim(),
      raca: raca.trim(),
      idade: idade ? Number(idade) : '',
      peso: peso ? Number(peso) : '',
      tutorNome: tutorNome.trim(),
      contatoTutor: contatoTutor.trim(),
      clinica: clinica.trim(),
      cuidadoPrincipal: cuidadoPrincipal.trim(),
      foto: photoUri || null,
    };
    setSaving(true);
    try {
      await setUser(payload);
      navigation.navigate('PerfilPet');
    } catch (_err) {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearLocal = () => {
    setPetNome(''); setEspecie(''); setRaca(''); setIdade(''); setPeso(''); setTutorNome(''); setContatoTutor(''); setClinica(''); setCuidadoPrincipal(''); setPhotoUri(null);
  };

  const handleClearPersisted = () => {
    Alert.alert('Confirmar', 'Remover dados persistidos do pet?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'OK', onPress: async () => { if (clearUser) await clearUser(); handleClearLocal(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <HeaderSection title="Cadastro do Pet" subtitle="Registre os dados para acompanhar os cuidados" />

        <ProfileCard>
          <AppInput label="Nome do pet" value={petNome} onChangeText={setPetNome} placeholder="Nome do pet" leftIcon="🐶" />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput label="Espécie" value={especie} onChangeText={setEspecie} placeholder="Cão / Gato" leftIcon="🐾" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput label="Raça" value={raca} onChangeText={setRaca} placeholder="Ex: SRD / Labrador" leftIcon="🏷️" />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput label="Idade" value={idade} onChangeText={setIdade} placeholder="Ex: 3 anos" leftIcon="⏳" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="Ex: 7.5" leftIcon="⚖️" keyboardType="numeric" />
            </View>
          </View>

          <AppInput label="Nome do tutor" value={tutorNome} onChangeText={setTutorNome} placeholder="Nome do responsável" leftIcon="👤" />
          <AppInput label="Contato do tutor" value={contatoTutor} onChangeText={setContatoTutor} placeholder="Telefone ou WhatsApp" leftIcon="📞" keyboardType="phone-pad" />
          <AppInput label="Clínica de referência" value={clinica} onChangeText={setClinica} placeholder="Nome da clínica" leftIcon="🏥" />
          <AppInput label="Condição / Cuidado principal" value={cuidadoPrincipal} onChangeText={setCuidadoPrincipal} placeholder="Ex: Vacina atrasada" leftIcon="⚠️" />

          <TouchableOpacity style={styles.photoCard} onPress={handleOpenCamera} activeOpacity={0.8}>
            <Text style={styles.photoLabel}>📷 Capturar Foto do Pet</Text>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : null}
          </TouchableOpacity>

          <View style={{ height: 12 }} />

          <ProfileCard title="Pré-visualização" icon="🔎">
            <Text style={{ fontWeight: '700', color: colors.text }}>{petNome || '—'}</Text>
            <Text style={{ color: colors.textMuted }}>{especie ? `${especie} • ${raca || '-'}` : 'Espécie não informada'}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>{cuidadoPrincipal ? `Cuidado: ${cuidadoPrincipal}` : 'Sem cuidado principal'}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>{tutorNome ? `Tutor: ${tutorNome} (${contatoTutor || 'sem contato'})` : 'Tutor não informado'}</Text>
          </ProfileCard>

          <View style={{ height: 8 }} />
          <AppButton title={saving ? 'Salvando...' : 'Salvar'} onPress={handleSave} loading={saving} style={{ width: '100%' }} />
          <View style={{ height: 8 }} />
          <AppButton title="Limpar" onPress={handleClearLocal} variant="outline" style={{ width: '100%' }} />
          <View style={{ height: 8 }} />
          <AppButton title="Limpar persistido" onPress={handleClearPersisted} variant="outline" style={{ width: '100%' }} />
        </ProfileCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
  rowInputs: { flexDirection: 'row', marginTop: 8, alignItems: 'flex-start' },
  photoCard: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: { fontWeight: '700', color: colors.text },
  photoPreview: { width: 88, height: 88, borderRadius: 44, marginTop: 8 },
});
