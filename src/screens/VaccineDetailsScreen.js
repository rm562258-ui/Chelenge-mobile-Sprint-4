import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ProfileCard from '../components/ui/ProfileCard';
import { usePetOptions } from '../hooks/usePetOptions';
import { useDeleteVaccine, useVaccines } from '../hooks/useVaccines';
import { useAppTheme } from '../context/ThemeProvider';
import { formatDisplayDate } from '../utils/date';

export default function VaccineDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data, isLoading, isError, refetch } = useVaccines();
    const { getPetName } = usePetOptions();
    const vaccine = Array.isArray(data) ? data.find((v) => String(v.id) === String(id)) : null;
    const deleteMutation = useDeleteVaccine();

    const handleDelete = () => {
        Alert.alert('Confirmar', 'Deseja excluir este registro vacinal?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteMutation.mutateAsync(id);
                        navigation.popTo('Vaccines');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível excluir a vacina. Tente novamente.');
                    }
                },
            }
        ]);
    };

    if (!vaccine) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
                {isLoading ? <LoadingSkeleton rows={1} /> : isError
                    ? <ErrorState title="Não foi possível carregar a vacina." onRetry={refetch} />
                    : <EmptyState title="Vacina não encontrada." description="O registro pode ter sido excluído." />}
            </SafeAreaView>
        );
    }

    const nextDoseDate = vaccine.nextDoseDate !== undefined ? vaccine.nextDoseDate : vaccine.boosterDate;

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={vaccine.name || 'Vacina'} icon="💉">
                    <Text style={{ color: colors.textMuted }}>Pet: {getPetName(vaccine.petId)}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Data: {formatDisplayDate(vaccine.date || '') || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Dose: {vaccine.dose || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Próximo reforço: {nextDoseDate ? formatDisplayDate(nextDoseDate) : 'Não informado'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>{vaccine.notes || ''}</Text>
                </ProfileCard>
                <View style={{ height: 12 }} />
                <AppButton title="Editar" onPress={() => navigation.navigate('VaccineForm', { id })} />
                <View style={{ height: 8 }} />
                <AppButton title="Excluir" variant="outline" onPress={handleDelete} loading={deleteMutation.isPending} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
