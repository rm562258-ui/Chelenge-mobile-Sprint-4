import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import PetSelector from '../components/ui/PetSelector';
import ProfileCard from '../components/ui/ProfileCard';
import { usePetOptions } from '../hooks/usePetOptions';
import { useCreateVaccine, useUpdateVaccine, useVaccines } from '../hooks/useVaccines';
import { useAppTheme } from '../context/ThemeProvider';
import { maskDateInput, toFormDate } from '../utils/date';
import { vaccineFormSchema } from '../utils/formSchemas';
import { getNextDoseDate } from '../utils/vaccines';

const EMPTY_VACCINE = { name: '', petId: '', date: '', dose: '', nextDoseDate: '', notes: '' };

const toFormValues = (vaccine) => ({
    name: vaccine.name ?? '',
    petId: vaccine.petId != null ? String(vaccine.petId) : '',
    date: toFormDate(vaccine.date),
    dose: vaccine.dose ?? '',
    nextDoseDate: toFormDate(getNextDoseDate(vaccine)),
    notes: vaccine.notes ?? '',
});

export default function VaccineFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data } = useVaccines();
    const { options: petOptions, isLoading: isPetsLoading } = usePetOptions();
    const vaccine = id && Array.isArray(data) ? data.find((item) => String(item.id) === String(id)) : null;
    const values = useMemo(() => (vaccine ? toFormValues(vaccine) : undefined), [vaccine]);

    // keepDirtyValues: um refetch em segundo plano não apaga o que o usuário já digitou.
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(vaccineFormSchema),
        defaultValues: EMPTY_VACCINE,
        values,
        resetOptions: { keepDirtyValues: true },
    });

    const createMutation = useCreateVaccine();
    const updateMutation = useUpdateVaccine();

    const onSubmit = async (formValues) => {
        try {
            if (id) {
                await updateMutation.mutateAsync({ id, payload: formValues });
            } else {
                await createMutation.mutateAsync(formValues);
            }
            navigation.popTo('Vaccines');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar a vacina. Tente novamente.');
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Vacina' : 'Nova Vacina'} icon="💉">
                    <Controller control={control} name="name" render={({ field }) => <AppInput label="Vacina" value={field.value} onChangeText={field.onChange} placeholder="V10 / Antirrábica" error={errors.name?.message} />} />
                    <Controller control={control} name="petId" render={({ field }) => <PetSelector options={petOptions} value={field.value} onChange={field.onChange} loading={isPetsLoading} error={errors.petId?.message} />} />
                    <Controller control={control} name="date" render={({ field }) => <AppInput label="Data da aplicação" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.date?.message} />} />
                    <Controller control={control} name="dose" render={({ field }) => <AppInput label="Dose" value={field.value} onChangeText={field.onChange} placeholder="1ª dose / reforço" error={errors.dose?.message} />} />
                    <Controller control={control} name="nextDoseDate" render={({ field }) => <AppInput label="Data do próximo reforço" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.nextDoseDate?.message} />} />
                    <Controller control={control} name="notes" render={({ field }) => <AppInput label="Notas" value={field.value} onChangeText={field.onChange} placeholder="Observações" />} />
                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar' : 'Registrar'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: 16 } });
