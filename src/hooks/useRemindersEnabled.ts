import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

type ReminderUserContext = {
    user?: { lembretesAtivos?: boolean };
};

export function useRemindersEnabled(): boolean {
    const context = useContext(UserContext) as ReminderUserContext | null;
    return context?.user?.lembretesAtivos !== false;
}
