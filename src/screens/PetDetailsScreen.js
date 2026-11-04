import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import DetailFallback from '../components/ui/DetailFallback';
import ProfileCard from '../components/ui/ProfileCard';
import { useDeletePet, usePet } from '../hooks/usePets';
import { useAppTheme } from '../context/ThemeProvider';
import { confirmDelete } from '../utils/confirmDelete';

export default function PetDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data: pet, isLoading, isError, refetch } = usePet(id);
    const deleteMutation = useDeletePet();

    const handleDelete = () => confirmDelete({
        message: 'Deseja excluir este pet?',
        errorMessage: 'Não foi possível excluir o pet.',
        onConfirm: async () => {
            await deleteMutation.mutateAsync(id);
            navigation.popTo('Pets');
        },
    });

    if (!pet) {
        return (
            <DetailFallback
                isLoading={isLoading}
                isError={isError}
                onRetry={refetch}
                errorTitle="Não foi possível carregar o pet."
                emptyTitle="Pet não encontrado."
                emptyDescription="Ele pode ter sido excluído."
            />
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={pet.petNome || pet.name || '—'} icon="🐾">
                    <Text style={{ color: colors.textMuted }}>{pet.especie || pet.type || '-'} • {pet.raca || pet.breed || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Idade: {pet.idade || pet.age || '-'}</Text>
                    <Text style={{ color: colors.text }}>Peso: {(pet.peso || pet.weight) ? `${pet.peso || pet.weight} kg` : '-'}</Text>
                </ProfileCard>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <AppButton title="Editar" onPress={() => navigation.navigate('CadastroPet', { id })} style={{ flex: 1 }} />
                    <AppButton title="Excluir" variant="outline" onPress={handleDelete} loading={deleteMutation.isPending} style={{ flex: 1 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({ container: { padding: 16 } });
