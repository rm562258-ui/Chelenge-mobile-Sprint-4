import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ProfileCard from '../components/ui/ProfileCard';
import { useDeleteMedication, useMedications } from '../hooks/useMedications';
import { usePetOptions } from '../hooks/usePetOptions';
import { useAppTheme } from '../context/ThemeProvider';
import { formatDisplayDate } from '../utils/date';

export default function MedicationDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data, isLoading, isError, refetch } = useMedications();
    const { getPetName } = usePetOptions();
    const med = Array.isArray(data) ? data.find((m) => String(m.id) === String(id)) : null;
    const deleteMutation = useDeleteMedication();

    const handleDelete = () => {
        Alert.alert('Confirmar', 'Deseja excluir este medicamento?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteMutation.mutateAsync(id);
                        navigation.popTo('Medications');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível excluir o medicamento. Tente novamente.');
                    }
                },
            }
        ]);
    };

    if (!med) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
                {isLoading ? <LoadingSkeleton rows={1} /> : isError
                    ? <ErrorState title="Não foi possível carregar o medicamento." onRetry={refetch} />
                    : <EmptyState title="Medicamento não encontrado." description="O registro pode ter sido excluído." />}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={med.name || 'Medicamento'} icon="💊">
                    <Text style={{ color: colors.textMuted }}>Pet: {getPetName(med.petId)}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Frequência: {med.frequency || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Dosagem: {med.dosage || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Início: {med.startDate ? formatDisplayDate(med.startDate) : '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Fim: {med.endDate ? formatDisplayDate(med.endDate) : 'Uso contínuo'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>{med.notes || ''}</Text>
                </ProfileCard>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <AppButton title="Editar" onPress={() => navigation.navigate('MedicationForm', { id })} style={{ flex: 1 }} />
                    <AppButton title="Excluir" variant="outline" onPress={handleDelete} loading={deleteMutation.isPending} style={{ flex: 1 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
