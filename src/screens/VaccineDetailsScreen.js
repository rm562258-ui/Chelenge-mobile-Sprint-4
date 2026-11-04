import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import DetailFallback from '../components/ui/DetailFallback';
import ProfileCard from '../components/ui/ProfileCard';
import { usePetOptions } from '../hooks/usePetOptions';
import { useDeleteVaccine, useVaccines } from '../hooks/useVaccines';
import { useAppTheme } from '../context/ThemeProvider';
import { confirmDelete } from '../utils/confirmDelete';
import { formatDisplayDate } from '../utils/date';
import { getNextDoseDate } from '../utils/vaccines';

export default function VaccineDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data, isLoading, isError, refetch } = useVaccines();
    const { getPetName } = usePetOptions();
    const vaccine = Array.isArray(data) ? data.find((v) => String(v.id) === String(id)) : null;
    const deleteMutation = useDeleteVaccine();

    const handleDelete = () => confirmDelete({
        message: 'Deseja excluir este registro vacinal?',
        errorMessage: 'Não foi possível excluir a vacina. Tente novamente.',
        onConfirm: async () => {
            await deleteMutation.mutateAsync(id);
            navigation.popTo('Vaccines');
        },
    });

    if (!vaccine) {
        return (
            <DetailFallback
                isLoading={isLoading}
                isError={isError}
                onRetry={refetch}
                errorTitle="Não foi possível carregar a vacina."
                emptyTitle="Vacina não encontrada."
                emptyDescription="O registro pode ter sido excluído."
            />
        );
    }

    const nextDoseDate = getNextDoseDate(vaccine);

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
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <AppButton title="Editar" onPress={() => navigation.navigate('VaccineForm', { id })} style={{ flex: 1 }} />
                    <AppButton title="Excluir" variant="outline" onPress={handleDelete} loading={deleteMutation.isPending} style={{ flex: 1 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
