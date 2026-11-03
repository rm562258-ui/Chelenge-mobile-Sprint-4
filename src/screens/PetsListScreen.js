import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import HeaderSection from '../components/ui/HeaderSection';
import ProfileCard from '../components/ui/ProfileCard';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import SearchBar from '../components/ui/SearchBar';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePets } from '../hooks/usePets';
import { useAppTheme } from '../context/ThemeProvider';

export default function PetsListScreen({ navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { data, isLoading, isError, isRefetching, refetch } = usePets();
    const [query, setQuery] = useState('');
    const [sort] = useState('name');
    const debouncedQuery = useDebouncedValue(query);

    const items = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((p) => (p.petNome || p.name || '').toLowerCase().includes(debouncedQuery.toLowerCase()));
        if (sort === 'name') return filtered.sort((a, b) => (a.petNome || '').localeCompare(b.petNome || ''));
        return filtered;
    }, [data, debouncedQuery, sort]);

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                // Elemento (e não função): uma função nova a cada render remontaria a busca e fecharia o teclado.
                ListHeaderComponent={(
                    <View style={styles.header}>
                        <HeaderSection title="Meus Pets" subtitle="Gerencie seus pets" />
                        <View style={styles.controls}>
                            <SearchBar placeholder="Buscar por nome" value={query} onChangeText={setQuery} />
                            <AppButton title="Novo" onPress={() => navigation.navigate('CadastroPet')} style={styles.newButton} />
                        </View>
                    </View>
                )}
                data={items}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListEmptyComponent={isError ? <ErrorState title="Erro ao carregar pets." onRetry={refetch} /> : !isLoading ? <EmptyState title="Nenhum pet encontrado." description="Cadastre um pet ou ajuste sua busca." /> : null}
                ListFooterComponent={isLoading && !data ? <LoadingSkeleton rows={3} /> : null}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PetDetails', { id: item.id })}>
                        <ProfileCard title={item.petNome || item.name || '—'} icon="🐾">
                            <Text style={{ color: colors.textMuted }}>{item.especie || '-'} • {item.raca || '-'}</Text>
                            <Text style={[
                                styles.syncStatus,
                                { color: item.pendingSync ? colors.placeholder : colors.success },
                            ]}>
                                {item.pendingSync ? 'Salvo offline' : 'Sincronizado'}
                            </Text>
                        </ProfileCard>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    header: { padding: 16 },
    controls: { gap: 8 },
    newButton: { alignSelf: 'flex-start' },
    syncStatus: { fontSize: 12, fontWeight: '700', marginTop: 8 },
});
