type VaccineDoseDates = {
    boosterDate?: string;
    nextDoseDate?: string;
};

/** `boosterDate` é o nome antigo do campo. `nextDoseDate` vazio significa que o reforço foi removido. */
export const getNextDoseDate = (vaccine: VaccineDoseDates) => (
    vaccine.nextDoseDate !== undefined ? vaccine.nextDoseDate : vaccine.boosterDate
);
