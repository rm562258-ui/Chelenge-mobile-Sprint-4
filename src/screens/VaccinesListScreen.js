import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { useVaccines } from '../hooks/useVaccines';
import SearchBar from '../components/ui/SearchBar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import { useFilteredVaccines } from '../hooks/useFilteredVaccines';
import { usePetOptions } from '../hooks/usePetOptions';
import { useAppTheme } from '../context/ThemeProvider';
import { formatDisplayDate } from '../utils/date';
import { getNextDoseDate } from '../utils/vaccines';

export default function VaccinesListScreen({ navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { data, isLoading, isError, isRefetching, refetch } = useVaccines();
    const { getPetName } = usePetOptions();
    const { items, query, setQuery, filterActive, toggleFilter } = useFilteredVaccines(data);

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <FlatList
                keyboardShouldPersistTaps="handled"
                // Elemento (e não função): uma função nova a cada render remontaria a busca e fecharia o teclado.
                ListHeaderComponent={(
                    <View style={styles.header}>
                        <HeaderSection title="Carteira Vacinal" subtitle="Registre e visualize vacinas" />
                        <View style={styles.controls}>
                            <SearchBar value={query} onChangeText={setQuery} />
                            <View style={styles.actions}>
                                <AppButton title={filterActive ? 'Todas' : 'Reforço'} variant="outline" onPress={toggleFilter} />
                                <AppButton title="Nova" onPress={() => navigation.navigate('VaccineForm')} />
                            </View>
                        </View>
                    </View>
                )}
                data={items}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar vacinas." onRetry={refetch} /> : !isLoading ? <EmptyState title="Nenhuma vacina encontrada." description="Registre a vacinação do seu pet." /> : null}
                ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
                keyExtractor={(item, index) => item.id?.toString() || `${item.name || 'vacina'}-${item.date || index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('VaccineDetails', { id: item.id })}>
                        <ProfileCard title={item.name || '—'} icon="💉">
                            <Text style={{ color: colors.textMuted }}>Pet: {getPetName(item.petId)}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Data: {formatDisplayDate(item.date || '') || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Dose: {item.dose || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Reforço: {formatDisplayDate(getNextDoseDate(item) || '') || '-'}</Text>
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
