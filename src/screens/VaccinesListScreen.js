import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { useVaccines } from '../hooks/useVaccines';
import SearchBar from '../components/ui/SearchBar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAppTheme } from '../context/ThemeProvider';
import { formatDisplayDate } from '../utils/date';

export default function VaccinesListScreen({ navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { data, isLoading, isError, refetch } = useVaccines();
    const [query, setQuery] = useState('');
    const [withBooster, setWithBooster] = useState(false);
    const debouncedQuery = useDebouncedValue(query);

    const items = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        return list.filter((v) => {
            const matchesQuery = (v.name || '').toLowerCase().includes(debouncedQuery.toLowerCase());
            return matchesQuery && (!withBooster || !!v.boosterDate);
        });
    }, [data, debouncedQuery, withBooster]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <HeaderSection title="Carteira Vacinal" subtitle="Registre e visualize vacinas" />
                        <View style={styles.controls}>
                            <SearchBar value={query} onChangeText={setQuery} />
                            <View style={styles.actions}>
                                <AppButton title={withBooster ? 'Todas' : 'Reforço'} variant="outline" onPress={() => setWithBooster((current) => !current)} />
                                <AppButton title="Nova" onPress={() => navigation.navigate('VaccineForm')} />
                            </View>
                        </View>
                    </View>
                )}
                data={items}
                refreshControl={<RefreshControl refreshing={isLoading && !!data} onRefresh={refetch} />}
                ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar vacinas." onRetry={refetch} /> : !isLoading ? <EmptyState title="Nenhuma vacina encontrada." description="Registre a vacinação do seu pet." /> : null}
                ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
                keyExtractor={(item, index) => item.id?.toString() || `${item.name || 'vacina'}-${item.date || index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('VaccineDetails', { id: item.id })}>
                        <ProfileCard title={item.name || '—'} icon="💉">
                            <Text style={{ color: colors.textMuted }}>Pet: {item.petId || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Data: {formatDisplayDate(item.date || '') || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Dose: {item.dose || '-'}</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Reforço: {item.boosterDate ? formatDisplayDate(item.boosterDate) : '-'}</Text>
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
