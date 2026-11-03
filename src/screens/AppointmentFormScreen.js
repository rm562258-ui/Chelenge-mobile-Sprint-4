import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { formatDisplayDate, maskDateInput, maskTimeInput } from '../utils/date';
import { useAppTheme } from '../context/ThemeProvider';
import { APPOINTMENT_REMINDER_OPTIONS, APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_TYPE_OPTIONS } from '../constants/appointments';
import { createAppointmentFormSchema } from '../utils/formSchemas';

const EMPTY_APPOINTMENT = { petName: '', date: '', time: '', reminder: '1h', type: 'Consulta', status: 'Agendada', clinic: '', veterinarian: '', notes: '' };

const isReminderOption = (value) => APPOINTMENT_REMINDER_OPTIONS.some((option) => option.value === value);

const toFormValues = (appointment) => ({
    petName: appointment.petName ?? '',
    date: maskDateInput(formatDisplayDate(appointment.date ?? '')),
    time: appointment.time ?? '',
    reminder: isReminderOption(appointment.reminder) ? appointment.reminder : '1h',
    // Consultas antigas podiam ter tipo livre (ex.: "Consulta preventiva"); o formulário só oferece os dois tipos.
    type: /retorno/i.test(appointment.type ?? '') ? 'Retorno' : 'Consulta',
    // 'Atrasada' é calculada na leitura; no formulário a consulta está a realizar ou já realizada.
    status: appointment.status === 'Concluída' ? 'Concluída' : 'Agendada',
    clinic: appointment.clinic ?? '',
    veterinarian: appointment.veterinarian ?? '',
    notes: appointment.notes ?? '',
});

function OptionGroup({ label, options, value, onChange, styles, horizontal = false, error }) {
    return (
        <View style={styles.optionGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={horizontal ? styles.optionRow : styles.optionWrap}>
                {options.map((option) => {
                    const selected = value === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.option, horizontal && styles.optionHorizontal, selected && styles.optionSelected]}
                            onPress={() => onChange(option.value)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                        >
                            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

export default function AppointmentFormScreen({ route, navigation }) {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = route.params || {};

    const { data } = useAppointments();
    const appointment = id && Array.isArray(data) ? data.find((item) => String(item.id) === String(id)) : null;
    const values = useMemo(() => (appointment ? toFormValues(appointment) : undefined), [appointment]);
    const schema = useMemo(() => createAppointmentFormSchema(!!id), [id]);
    // keepDirtyValues: um refetch em segundo plano não apaga o que o usuário já digitou.
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_APPOINTMENT,
        values,
        resetOptions: { keepDirtyValues: true },
    });

    const createMutation = useCreateAppointment();
    const updateMutation = useUpdateAppointment();

    const onSubmit = async (formValues) => {
        try {
            if (id) {
                const payload = { ...formValues };
                if (!payload.time) delete payload.time;
                await updateMutation.mutateAsync({ id, payload });
            } else {
                await createMutation.mutateAsync(formValues);
            }
            navigation.popTo('AgendaCuidados');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar a consulta. Tente novamente.');
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <ProfileCard title={id ? 'Editar Consulta' : 'Nova Consulta'} icon="📅">
                    <Controller control={control} name="petName" render={({ field }) => (
                        <AppInput label="Nome do pet" value={field.value} onChangeText={field.onChange} placeholder="Nome do pet" error={errors.petName?.message} />
                    )} />

                    <Controller control={control} name="date" render={({ field }) => (
                        <AppInput label="Data" value={field.value} onChangeText={(value) => field.onChange(maskDateInput(value))} placeholder="DD/MM/AA" keyboardType="numeric" error={errors.date?.message} />
                    )} />

                    <Controller control={control} name="time" render={({ field }) => (
                        <AppInput label="Horário" value={field.value} onChangeText={(value) => field.onChange(maskTimeInput(value))} placeholder="HH:mm" keyboardType="numeric" error={errors.time?.message} />
                    )} />

                    <Controller control={control} name="status" render={({ field }) => (
                        <OptionGroup label="Situação" options={APPOINTMENT_STATUS_OPTIONS} value={field.value} onChange={field.onChange} styles={styles} horizontal />
                    )} />

                    <Controller control={control} name="reminder" render={({ field }) => (
                        <OptionGroup label="Lembrete" options={APPOINTMENT_REMINDER_OPTIONS} value={field.value} onChange={field.onChange} styles={styles} />
                    )} />

                    <Controller control={control} name="type" render={({ field }) => (
                        <OptionGroup label="Tipo" options={APPOINTMENT_TYPE_OPTIONS} value={field.value} onChange={field.onChange} styles={styles} horizontal error={errors.type?.message} />
                    )} />

                    <Controller control={control} name="clinic" render={({ field }) => (
                        <AppInput label="Clínica (opcional)" value={field.value} onChangeText={field.onChange} placeholder="Clínica Clyvo Vet" />
                    )} />

                    <Controller control={control} name="veterinarian" render={({ field }) => (
                        <AppInput label="Veterinário (opcional)" value={field.value} onChangeText={field.onChange} placeholder="Nome do veterinário" />
                    )} />

                    <Controller control={control} name="notes" render={({ field }) => (
                        <AppInput label="Notas" value={field.value} onChangeText={field.onChange} placeholder="Observações" />
                    )} />

                    <View style={{ height: 12 }} />
                    <AppButton title={id ? 'Salvar' : 'Salvar consulta'} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} />
                </ProfileCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: 16 },
    optionGroup: { marginTop: 10 },
    label: { color: colors.text, fontSize: 12, fontWeight: '600', marginBottom: 6 },
    option: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: colors.surface },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    optionText: { color: colors.textMuted },
    optionTextSelected: { color: colors.primary, fontWeight: '700' },
    optionRow: { flexDirection: 'row', gap: 8 },
    optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionHorizontal: { flex: 1, alignItems: 'center' },
    errorText: { color: colors.danger, marginTop: 6, fontSize: 12 },
});
