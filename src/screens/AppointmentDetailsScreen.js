import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppointments, useDeleteAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { formatDisplayDate } from '../utils/date';
import { useAppTheme } from '../context/ThemeProvider';
import { APPOINTMENT_REMINDER_LABELS } from '../constants/appointments';

export default function AppointmentDetailsScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};
    const { data, isLoading, isError, refetch } = useAppointments();
    const appointment = Array.isArray(data) ? data.find((a) => String(a.id) === String(id)) : null;
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
                        navigation.popTo('AgendaCuidados');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível excluir a consulta. Tente novamente.');
                    }
                }
            }
        ]);
    };

    if (!appointment) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
                {isLoading ? <LoadingSkeleton rows={1} /> : isError
                    ? <ErrorState title="Não foi possível carregar a consulta." onRetry={refetch} />
                    : <EmptyState title="Consulta não encontrada." description="Ela pode ter sido excluída." />}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <ProfileCard title={appointment?.title || 'Consulta'} icon="📌">
                    <Text style={{ color: colors.textMuted }}>{appointment?.type || '-'} • {appointment?.status || '-'}</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 8 }}>Pet: {appointment?.petName || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Data: {formatDisplayDate(appointment?.date || '') || '-'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Horário: {appointment?.time || 'Não informado'}</Text>
                    <Text style={{ color: colors.text, marginTop: 8 }}>Lembrete: {APPOINTMENT_REMINDER_LABELS[appointment?.reminder] || 'Sem lembrete'}</Text>
                    {appointment.clinic ? <Text style={{ color: colors.text, marginTop: 8 }}>Clínica: {appointment.clinic}</Text> : null}
                    {appointment.veterinarian ? <Text style={{ color: colors.text, marginTop: 8 }}>Veterinário: {appointment.veterinarian}</Text> : null}
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
                <AppButton title="Excluir" variant="outline" onPress={handleDelete} loading={deleteMutation.isPending} />
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
