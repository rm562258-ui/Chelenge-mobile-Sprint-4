import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import ProfileCard from '../components/ui/ProfileCard';
import { useCreatePet, usePet, useUpdatePet } from '../hooks/usePets';
import { useAppTheme } from '../context/ThemeProvider';
import { petFormSchema } from '../utils/formSchemas';

const EMPTY_PET = { petNome: '', especie: '', raca: '', idade: '', peso: '' };

const onlyDigits = (value = '') => value.replace(/\D/g, '');

const onlyNumber = (value = '') => {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [integerPart, ...decimalParts] = normalized.split('.');
    return decimalParts.length ? `${integerPart}.${decimalParts.join('')}` : integerPart;
};

const toFormValues = (pet) => ({
    petNome: pet.petNome ?? pet.name ?? '',
    especie: pet.especie ?? pet.type ?? '',
    raca: pet.raca ?? pet.breed ?? '',
    idade: String(pet.idade ?? pet.age ?? ''),
    peso: String(pet.peso ?? pet.weight ?? ''),
});

export default function PetFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data: pet } = usePet(id);
    const values = useMemo(() => (pet ? toFormValues(pet) : undefined), [pet]);

    // keepDirtyValues: um refetch em segundo plano não apaga o que o usuário já digitou.
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(petFormSchema),
        defaultValues: EMPTY_PET,
        values,
        resetOptions: { keepDirtyValues: true },
    });

    const createMutation = useCreatePet();
    const updateMutation = useUpdatePet();

    const onSubmit = async (formValues) => {
        try {
            if (id) {
                await updateMutation.mutateAsync({ id, payload: formValues });
            } else {
                await createMutation.mutateAsync(formValues);
            }
            navigation.popTo('Pets');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar o pet. Tente novamente.');
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Pet' : 'Novo Pet'} icon="📝">
                    <Controller control={control} name="petNome" render={({ field }) => (
                        <AppInput label="Nome do pet" value={field.value} onChangeText={field.onChange} placeholder="Nome" error={errors.petNome?.message} />
                    )} />

                    <Controller control={control} name="especie" render={({ field }) => (
                        <AppInput label="Espécie" value={field.value} onChangeText={field.onChange} placeholder="Cão / Gato" error={errors.especie?.message} />
                    )} />

                    <Controller control={control} name="raca" render={({ field }) => (
                        <AppInput label="Raça" value={field.value} onChangeText={field.onChange} placeholder="SRD / Labrador" error={errors.raca?.message} />
                    )} />

                    <Controller control={control} name="idade" render={({ field }) => (
                        <AppInput label="Idade" value={String(field.value ?? '')} onChangeText={(value) => field.onChange(onlyDigits(value))} placeholder="Idade em anos" keyboardType="numeric" error={errors.idade?.message} />
                    )} />

                    <Controller control={control} name="peso" render={({ field }) => (
                        <AppInput label="Peso (kg)" value={String(field.value ?? '')} onChangeText={(value) => field.onChange(onlyNumber(value))} placeholder="Peso em kg" keyboardType="decimal-pad" error={errors.peso?.message} />
                    )} />

                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar alterações' : 'Criar pet'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 16 },
});
