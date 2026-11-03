import { useHomeSummary } from './useHomeSummary';
import { formatDisplayDate, parseAppDate } from '../utils/date';

type AppointmentWithClinic = {
    clinic?: string;
    date?: string;
};

/** Resumo de cuidados do perfil: clínica usada com mais frequência recente e próximo cuidado agendado. */
export function useCareProfile() {
    const { appointmentsQuery, nextAppointment, nextVaccine } = useHomeSummary();
    const appointments: AppointmentWithClinic[] = Array.isArray(appointmentsQuery.data) ? appointmentsQuery.data : [];

    const referenceClinic = appointments
        .filter((appointment) => appointment.clinic?.trim())
        .sort((first, second) => (parseAppDate(second.date)?.getTime() ?? 0) - (parseAppDate(first.date)?.getTime() ?? 0))[0]
        ?.clinic ?? null;

    const appointmentCare = nextAppointment
        ? `${nextAppointment.type || 'Consulta'} de ${nextAppointment.petName || 'seu pet'} em ${formatDisplayDate(nextAppointment.date)}`
            + `${nextAppointment.time ? ` às ${nextAppointment.time}` : ''}${nextAppointment.isOverdue ? ' (atrasada)' : ''}`
        : null;
    const vaccineCare = nextVaccine
        ? `Reforço de ${nextVaccine.name || 'vacina'} em ${formatDisplayDate(nextVaccine.dueDate)}${nextVaccine.isOverdue ? ' (vencido)' : ''}`
        : null;

    // O que ainda vai acontecer tem prioridade sobre o que já passou sem ser resolvido.
    const nextCare = (nextAppointment && !nextAppointment.isOverdue ? appointmentCare : null)
        ?? (nextVaccine && !nextVaccine.isOverdue ? vaccineCare : null)
        ?? appointmentCare
        ?? vaccineCare;

    return { referenceClinic, nextCare };
}
