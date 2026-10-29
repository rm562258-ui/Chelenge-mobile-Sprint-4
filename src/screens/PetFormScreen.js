import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import * as z from 'zod';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import ProfileCard from '../components/ui/ProfileCard';
import { useCreatePet, usePet, useUpdatePet } from '../hooks/usePets';
import { useAppTheme } from '../context/ThemeProvider';

const schema = z.object({
    petNome: z.string().min(1, 'Nome obrigatório'),
    especie: z.string().optional(),
    raca: z.string().optional(),
    idade: z.string().regex(/^\d*$/, 'A idade deve conter apenas números.').optional(),
    peso: z.string().regex(/^\d*(?:[.,]\d*)?$/, 'O peso deve conter apenas números.').optional(),
});

const onlyDigits = (value = '') => value.replace(/\D/g, '');

const onlyNumber = (value = '') => {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [integerPart, ...decimalParts] = normalized.split('.');
    return decimalParts.length ? `${integerPart}.${decimalParts.join('')}` : integerPart;
};

export default function PetFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data: pet } = usePet(id);

    const { control, handleSubmit, reset } = useForm({ resolver: zodResolver(schema), defaultValues: {} });

    useEffect(() => {
        if (pet) {
            reset({
                ...pet,
                idade: String(pet.idade ?? pet.age ?? ''),
                peso: String(pet.peso ?? pet.weight ?? ''),
            });
        }
    }, [pet, reset]);

    const createMutation = useCreatePet();
    const updateMutation = useUpdatePet();

    const onSubmit = async (values) => {
        try {
            if (id) {
                await updateMutation.mutateAsync({ id, payload: values });
            } else {
                await createMutation.mutateAsync(values);
            }
            navigation.navigate('Pets');
        } catch {
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Pet' : 'Novo Pet'} icon="📝">
                    <Controller control={control} name="petNome" render={({ field }) => (
                        <AppInput label="Nome do pet" value={field.value} onChangeText={field.onChange} placeholder="Nome" />
                    )} />

                    <Controller control={control} name="especie" render={({ field }) => (
                        <AppInput label="Espécie" value={field.value} onChangeText={field.onChange} placeholder="Cão / Gato" />
                    )} />

                    <Controller control={control} name="raca" render={({ field }) => (
                        <AppInput label="Raça" value={field.value} onChangeText={field.onChange} placeholder="SRD / Labrador" />
                    )} />

                    <Controller control={control} name="idade" render={({ field }) => (
                        <AppInput label="Idade" value={String(field.value ?? '')} onChangeText={(value) => field.onChange(onlyDigits(value))} placeholder="Ex.: 4" keyboardType="numeric" />
                    )} />

                    <Controller control={control} name="peso" render={({ field }) => (
                        <AppInput label="Peso (kg)" value={String(field.value ?? '')} onChangeText={(value) => field.onChange(onlyNumber(value))} placeholder="Ex.: 8,5" keyboardType="decimal-pad" />
                    )} />

                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar alterações' : 'Criar pet'} onPress={handleSubmit(onSubmit)} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 16 },
});
