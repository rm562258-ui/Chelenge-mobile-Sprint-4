import * as z from 'zod';
import { APPOINTMENT_TYPES } from '../constants/appointments';
import { parseAppDate } from './date';

const INVALID_DATE_MESSAGE = 'Informe uma data válida no formato DD/MM/AA';

const requiredAppDate = z.string().refine((value) => !!parseAppDate(value), INVALID_DATE_MESSAGE);
const optionalAppDate = z.string().optional().refine((value) => !value || !!parseAppDate(value), INVALID_DATE_MESSAGE);

export const petFormSchema = z.object({
    petNome: z.string().min(1, 'Nome obrigatório'),
    especie: z.string().optional(),
    raca: z.string().optional(),
    idade: z.string().regex(/^\d*$/, 'A idade deve conter apenas números.').optional(),
    peso: z.string().regex(/^\d*(?:[.,]\d*)?$/, 'O peso deve conter apenas números.').optional(),
});

export const createAppointmentFormSchema = (isEditing: boolean) => z.object({
    petName: z.string().trim().min(1, 'Selecione o pet'),
    date: requiredAppDate,
    time: z.string(),
    reminder: z.enum(['none', 'at_time', '30min', '1h', '1d']),
    type: z.enum(APPOINTMENT_TYPES, 'Selecione o tipo da consulta'),
    status: z.enum(['Agendada', 'Concluída', 'Atrasada']),
    clinic: z.string().optional(),
    veterinarian: z.string().optional(),
    notes: z.string().optional(),
}).superRefine((values, context) => {
    const timeIsValid = /^\d{2}:\d{2}$/.test(values.time)
        && Number(values.time.slice(0, 2)) <= 23
        && Number(values.time.slice(3, 5)) <= 59;

    // Sem restrição de data: a consulta pode ser registrada no passado, no presente ou no futuro.
    if (!timeIsValid && (!isEditing || values.time)) {
        context.addIssue({ code: 'custom', path: ['time'], message: 'Informe um horário válido entre 00:00 e 23:59' });
    }
});

export const vaccineFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome da vacina'),
    petId: z.string().min(1, 'Selecione o pet'),
    date: requiredAppDate,
    dose: z.string().optional(),
    nextDoseDate: optionalAppDate,
    notes: z.string().optional(),
});

export const medicationFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome do medicamento'),
    petId: z.string().min(1, 'Selecione o pet'),
    frequency: z.string().optional(),
    dosage: z.string().optional(),
    startDate: optionalAppDate,
    endDate: optionalAppDate,
    notes: z.string().optional(),
}).refine((values) => {
    const startDate = parseAppDate(values.startDate);
    const endDate = parseAppDate(values.endDate);
    return !startDate || !endDate || endDate >= startDate;
}, {
    path: ['endDate'],
    message: 'O fim do tratamento deve ser igual ou posterior ao início',
});

export const loginFormSchema = z.object({
    email: z.string().trim().email('Informe um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const registerFormSchema = z.object({
    name: z.string().trim().min(2, 'Informe seu nome completo.'),
    email: z.string().trim().email('Informe um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirme sua senha.'),
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
});

export const forgotPasswordFormSchema = z.object({
    email: z.string().trim().email('Informe um e-mail válido.'),
});
