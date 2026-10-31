import { useMemo } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import ProfileCard from '../components/ui/ProfileCard';
import { useDeleteVaccine, useVaccines } from '../hooks/useVaccines';
import { useAppTheme } from '../context/ThemeProvider';
import { formatDisplayDate } from '../utils/date';

export default function VaccineDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data } = useVaccines();
    const vaccine = Array.isArray(data) ? data.find((v) => v.id === id) : null;
    const deleteMutation = useDeleteVaccine();

    const handleDelete = () => {
        Alert.alert('Confirmar', 'Deseja excluir este registro vacinal?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: async () => { try { await deleteMutation.mutateAsync(id); navigation.navigate('Vaccines'); } catch { } } }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={vaccine?.name || 'Vacina'} icon="💉">
                    <Text style={{ color: colors.textMuted }}>Pet: {vaccine?.petId || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Data: {formatDisplayDate(vaccine?.date || '') || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Próximo reforço: {vaccine?.boosterDate ? formatDisplayDate(vaccine.boosterDate) : 'Não informado'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>{vaccine?.notes || ''}</Text>
                </ProfileCard>
                <View style={{ height: 12 }} />
                <AppButton title="Editar" onPress={() => navigation.navigate('VaccineForm', { id })} />
                <View style={{ height: 8 }} />
                <AppButton title="Excluir" variant="outline" onPress={handleDelete} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
