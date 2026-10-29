import { useMemo } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppointments, useDeleteAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { formatDisplayDate } from '../utils/date';
import { useAppTheme } from '../context/ThemeProvider';

export default function AppointmentDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data } = useAppointments();
    const appointment = Array.isArray(data) ? data.find((a) => a.id === id) : null;
    const deleteMutation = useDeleteAppointment();
    const updateMutation = useUpdateAppointment();

    const handleStatusChange = async (completed) => {
        try {
            await updateMutation.mutateAsync({
                id,
                payload: { status: completed ? 'Concluída' : 'Agendada' },
            });
        } catch {
            Alert.alert('Erro', 'Não foi possível atualizar o status da consulta.');
        }
    };

    const handleDelete = () => {
        Alert.alert('Confirmar', 'Deseja excluir esta consulta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive', onPress: async () => {
                    try {
                        await deleteMutation.mutateAsync(id);
                        navigation.navigate('AgendaCuidados');
                    } catch { }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={appointment?.title || 'Consulta'} icon="📌">
                    <Text style={{ color: colors.textMuted }}>{appointment?.type || '-'} • {appointment?.status || '-'}</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 8 }}>Pet: {appointment?.petName || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Data: {formatDisplayDate(appointment?.date || '') || '-'}</Text>
                    {appointment ? (
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>{appointment.status === 'Concluída' ? 'Concluída' : appointment.status === 'Atrasada' ? 'Atrasada' : 'Agendada'}</Text>
                            <Switch
                                value={appointment.status === 'Concluída'}
                                onValueChange={handleStatusChange}
                                disabled={updateMutation.isPending}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={appointment.status === 'Concluída' ? colors.success : colors.surface}
                            />
                        </View>
                    ) : null}
                    <Text style={{ color: colors.text, marginTop: 8 }}>{appointment?.notes || ''}</Text>
                </ProfileCard>

                <View style={{ height: 12 }} />
                <AppButton title="Editar" onPress={() => navigation.navigate('AppointmentForm', { id })} />
                <View style={{ height: 8 }} />
                <AppButton title="Excluir" variant="outline" onPress={handleDelete} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 16 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    statusLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
