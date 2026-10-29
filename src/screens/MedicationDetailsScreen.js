import { useMemo } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import ProfileCard from '../components/ui/ProfileCard';
import { useDeleteMedication, useMedications } from '../hooks/useMedications';
import { useAppTheme } from '../context/ThemeProvider';

export default function MedicationDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data } = useMedications();
    const med = Array.isArray(data) ? data.find((m) => m.id === id) : null;
    const deleteMutation = useDeleteMedication();

    const handleDelete = () => {
        Alert.alert('Confirmar', 'Deseja excluir este medicamento?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: async () => { try { await deleteMutation.mutateAsync(id); navigation.navigate('Medications'); } catch { } } }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={med?.name || 'Medicamento'} icon="💊">
                    <Text style={{ color: colors.textMuted }}>Frequência: {med?.frequency || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Dosagem: {med?.dosage || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>{med?.notes || ''}</Text>
                </ProfileCard>
                <View style={{ height: 12 }} />
                <AppButton title="Editar" onPress={() => navigation.navigate('MedicationForm', { id })} />
                <View style={{ height: 8 }} />
                <AppButton title="Excluir" variant="outline" onPress={handleDelete} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
