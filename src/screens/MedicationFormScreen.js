import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import PetSelector from '../components/ui/PetSelector';
import ProfileCard from '../components/ui/ProfileCard';
import { useCreateMedication, useMedications, useUpdateMedication } from '../hooks/useMedications';
import { usePetOptions } from '../hooks/usePetOptions';
import { useAppTheme } from '../context/ThemeProvider';
import { maskDateInput, toFormDate } from '../utils/date';
import { medicationFormSchema } from '../utils/formSchemas';

const EMPTY_MEDICATION = { name: '', petId: '', frequency: '', dosage: '', startDate: '', endDate: '', notes: '' };

const toFormValues = (medication) => ({
    name: medication.name ?? '',
    petId: medication.petId != null ? String(medication.petId) : '',
    frequency: medication.frequency ?? '',
    dosage: medication.dosage ?? '',
    startDate: toFormDate(medication.startDate),
    endDate: toFormDate(medication.endDate),
    notes: medication.notes ?? '',
});

export default function MedicationFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data } = useMedications();
    const { options: petOptions, isLoading: isPetsLoading } = usePetOptions();
    const medication = id && Array.isArray(data) ? data.find((item) => String(item.id) === String(id)) : null;
    const values = useMemo(() => (medication ? toFormValues(medication) : undefined), [medication]);

    // keepDirtyValues: um refetch em segundo plano não apaga o que o usuário já digitou.
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(medicationFormSchema),
        defaultValues: EMPTY_MEDICATION,
        values,
        resetOptions: { keepDirtyValues: true },
    });

    const createMutation = useCreateMedication();
    const updateMutation = useUpdateMedication();

    const onSubmit = async (formValues) => {
        try {
            if (id) {
                await updateMutation.mutateAsync({ id, payload: formValues });
            } else {
                await createMutation.mutateAsync(formValues);
            }
            navigation.popTo('Medications');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar o medicamento. Tente novamente.');
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Medicamento' : 'Novo Medicamento'} icon="💊">
                    <Controller control={control} name="name" render={({ field }) => <AppInput label="Nome" value={field.value} onChangeText={field.onChange} placeholder="Nome do medicamento" error={errors.name?.message} />} />
                    <Controller control={control} name="petId" render={({ field }) => <PetSelector options={petOptions} value={field.value} onChange={field.onChange} loading={isPetsLoading} error={errors.petId?.message} />} />
                    <Controller control={control} name="frequency" render={({ field }) => <AppInput label="Frequência" value={field.value} onChangeText={field.onChange} placeholder="1 vez ao dia" error={errors.frequency?.message} />} />
                    <Controller control={control} name="dosage" render={({ field }) => <AppInput label="Dosagem" value={field.value} onChangeText={field.onChange} placeholder="1 comprimido" error={errors.dosage?.message} />} />
                    <Controller control={control} name="startDate" render={({ field }) => <AppInput label="Início do tratamento" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.startDate?.message} />} />
                    <Controller control={control} name="endDate" render={({ field }) => <AppInput label="Fim do tratamento" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.endDate?.message} />} />
                    <Controller control={control} name="notes" render={({ field }) => <AppInput label="Notas" value={field.value} onChangeText={field.onChange} placeholder="Observações" />} />
                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar' : 'Registrar'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
