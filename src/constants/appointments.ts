export const APPOINTMENT_REMINDER_OPTIONS = [
    { value: 'none', label: 'Sem lembrete' },
    { value: 'at_time', label: 'No horário' },
    { value: '30min', label: '30 minutos antes' },
    { value: '1h', label: '1 hora antes' },
    { value: '1d', label: '1 dia antes' },
] as const;

export type AppointmentReminder = (typeof APPOINTMENT_REMINDER_OPTIONS)[number]['value'];

export const APPOINTMENT_TYPES = ['Consulta', 'Retorno'] as const;

export const APPOINTMENT_TYPE_OPTIONS = APPOINTMENT_TYPES.map((type) => ({ value: type, label: type }));

// 'Atrasada' não é escolhida no formulário: é calculada para consultas passadas que não foram concluídas.
export const APPOINTMENT_STATUS_OPTIONS = [
    { value: 'Agendada', label: 'A realizar' },
    { value: 'Concluída', label: 'Já realizada (concluída)' },
] as const;

export const APPOINTMENT_REMINDER_LABELS = {
    none: 'Sem lembrete',
    at_time: 'No horário',
    '30min': '30 minutos antes',
    '1h': '1 hora antes',
    '1d': '1 dia antes',
} as const;
