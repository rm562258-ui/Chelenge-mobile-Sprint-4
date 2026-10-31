import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { combineDateAndTime, formatDisplayDate, maskDateInput, maskTimeInput, parseAppDate } from '../utils/date';
import { useAppTheme } from '../context/ThemeProvider';
import { APPOINTMENT_REMINDER_OPTIONS } from '../constants/appointments';

const createSchema = (isEditing) => z.object({
    petName: z.string().min(1, 'Informe o nome do pet'),
    date: z.string().refine((value) => !!parseAppDate(value), 'Informe uma data válida no formato DD/MM/AA'),
    time: z.string(),
    reminder: z.enum(['none', 'at_time', '30min', '1h', '1d']),
    type: z.string().min(1, 'Informe o tipo da consulta'),
    status: z.enum(['Agendada', 'Concluída', 'Atrasada']),
    notes: z.string().optional(),
}).superRefine((values, context) => {
    const timeIsValid = /^\d{2}:\d{2}$/.test(values.time)
        && Number(values.time.slice(0, 2)) <= 23
        && Number(values.time.slice(3, 5)) <= 59;

    if (!timeIsValid && (!isEditing || values.time)) {
        context.addIssue({ code: 'custom', path: ['time'], message: 'Informe um horário válido entre 00:00 e 23:59' });
        return;
    }

    if (!isEditing && values.status === 'Agendada' && timeIsValid) {
        const scheduledAt = combineDateAndTime(values.date, values.time);
        if (scheduledAt && scheduledAt <= new Date()) {
            context.addIssue({ code: 'custom', path: ['date'], message: 'A data e o horário da consulta devem estar no futuro' });
        }
    }
});

export default function AppointmentFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};

    const { data } = useAppointments();
    const schema = useMemo(() => createSchema(!!id), [id]);
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { petName: '', date: '', time: '', reminder: '1h', type: '', status: 'Agendada', notes: '' },
    });

    useEffect(() => {
        if (id && data) {
            const appointment = data.find((item) => item.id === id);
            if (appointment) reset({
                ...appointment,
                date: maskDateInput(formatDisplayDate(appointment.date)),
                time: appointment.time || '',
                reminder: appointment.reminder || '1h',
            });
        }
    }, [id, data, reset]);

    const createMutation = useCreateAppointment();
    const updateMutation = useUpdateAppointment();

    const onSubmit = async (values) => {
        try {
            if (id) {
                const payload = { ...values };
                if (!payload.time) delete payload.time;
                await updateMutation.mutateAsync({ id, payload });
            } else {
                await createMutation.mutateAsync(values);
            }
            navigation.navigate('AgendaCuidados');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar a consulta. Tente novamente.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Consulta' : 'Nova Consulta'} icon="📅">
                    <Controller control={control} name="petName" render={({ field }) => (
                        <AppInput label="Nome do pet" value={field.value} onChangeText={field.onChange} placeholder="Nome do pet" />
                    )} />

                    <Controller control={control} name="date" render={({ field }) => (
                        <AppInput label="Data" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.date?.message} />
                    )} />

                    <Controller control={control} name="time" render={({ field }) => (
                        <AppInput label="Horário" value={field.value} onChangeText={(value) => field.onChange(maskTimeInput(value))} placeholder="HH:mm" keyboardType="numeric" error={errors.time?.message} />
                    )} />

                    <Controller control={control} name="reminder" render={({ field }) => (
                        <View style={styles.reminderGroup}>
                            <Text style={styles.label}>Lembrete</Text>
                            {APPOINTMENT_REMINDER_OPTIONS.map(({ value, label }) => (
                                <TouchableOpacity
                                    key={value}
                                    style={[styles.reminderOption, field.value === value && styles.reminderOptionSelected]}
                                    onPress={() => field.onChange(value)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: field.value === value }}
                                >
                                    <Text style={[styles.reminderText, field.value === value && styles.reminderTextSelected]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )} />

                    <Controller control={control} name="type" render={({ field }) => (
                        <AppInput label="Tipo" value={field.value} onChangeText={field.onChange} placeholder="Consulta / Retorno" error={errors.type?.message} />
                    )} />

                    <Controller control={control} name="notes" render={({ field }) => (
                        <AppInput label="Notas" value={field.value} onChangeText={field.onChange} placeholder="Observações" />
                    )} />

                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar' : 'Agendar'} onPress={handleSubmit(onSubmit)} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 16 },
    reminderGroup: { marginTop: 16 },
    label: { color: colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 },
    reminderOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 8, backgroundColor: colors.surface },
    reminderOptionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    reminderText: { color: colors.textMuted },
    reminderTextSelected: { color: colors.primary, fontWeight: '700' },
});
