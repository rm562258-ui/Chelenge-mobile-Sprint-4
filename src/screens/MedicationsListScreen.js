import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { useMedications } from '../hooks/useMedications';
import SearchBar from '../components/ui/SearchBar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePetOptions } from '../hooks/usePetOptions';
import { useAppTheme } from '../context/ThemeProvider';
import { isMedicationInProgress } from '../utils/date';

export default function MedicationsListScreen({ navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { data, isLoading, isError, isRefetching, refetch } = useMedications();
    const { getPetName } = usePetOptions();
    const [query, setQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const debouncedQuery = useDebouncedValue(query);

    const items = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        return list.filter((m) => {
            const matchesQuery = (m.name || '').toLowerCase().includes(debouncedQuery.toLowerCase());
            const isActive = isMedicationInProgress(m.endDate);
            return matchesQuery && (!activeOnly || isActive);
        });
    }, [data, debouncedQuery, activeOnly]);

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <FlatList
                // Elemento (e não função): uma função nova a cada render remontaria a busca e fecharia o teclado.
                ListHeaderComponent={(
                    <View style={styles.header}>
                        <HeaderSection title="Medicamentos" subtitle="Registre tratamentos e dosagens" />
                        <View style={styles.controls}>
                            <SearchBar value={query} onChangeText={setQuery} />
                            <View style={styles.actions}>
                                <AppButton title={activeOnly ? 'Todos' : 'Ativos'} variant="outline" onPress={() => setActiveOnly((current) => !current)} />
                                <AppButton title="Novo" onPress={() => navigation.navigate('MedicationForm')} />
                            </View>
                        </View>
                    </View>
                )}
                data={items}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar medicamentos." onRetry={refetch} /> : !isLoading ? <EmptyState title="Nenhum medicamento encontrado." description="Registre um tratamento para acompanhar seu pet." /> : null}
                ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
                keyExtractor={(item, index) => item.id?.toString() || `${item.name || 'medicamento'}-${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { id: item.id })}>
                        <ProfileCard title={item.name || '—'} icon="💊">
                            <Text style={{ color: colors.textMuted }}>Pet: {getPetName(item.petId)}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Frequência: {item.frequency || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Dosagem: {item.dosage || '-'}</Text>
                        </ProfileCard>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { padding: 16 },
    controls: { gap: 8 },
    actions: { flexDirection: 'row', gap: 8 },
});
