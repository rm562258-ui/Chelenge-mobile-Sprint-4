export function parseAppDate(value: string | null | undefined): Date | null {
    if (!value) return null;

    const displayDate = value.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    const match = displayDate ?? isoDate;

    if (!match) return null;

    const year = displayDate ? 2000 + Number(match[3]) : Number(match[1]);
    const month = Number(match[2]);
    const day = Number(displayDate ? match[1] : match[3]);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }

    return date;
}

export function formatDisplayDate(value: string = ''): string {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return isoDate ? `${isoDate[3]}/${isoDate[2]}/${isoDate[1].slice(-2)}` : value;
}

export function maskDateInput(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskTimeInput(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function combineDateAndTime(dateValue: Date | string, time: string): Date | null {
    const date = dateValue instanceof Date ? new Date(dateValue) : parseAppDate(dateValue);
    const match = time.match(/^(\d{2}):(\d{2})$/);

    if (!date || Number.isNaN(date.getTime()) || !match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;

    date.setHours(hours, minutes, 0, 0);
    return date;
}

export function isPast(date: Date): boolean {
    return date.getTime() < Date.now();
}
