import { Duration } from 'luxon';

export function addDots(value: string, maxLength?: number): string;
export function addDots(value: string | undefined | null, maxLength?: number): string | undefined | null;
export function addDots(value: string | undefined | null, maxLength = 48): string | undefined | null {
    const rolloff = '...';

    if (!value) return value;
    if (value.length > maxLength) {
        return value.substring(0, maxLength - rolloff.length) + rolloff;
    }

    return value;
}

export function isBlank(value: unknown): boolean {
    return typeof value !== 'string' || value.trim() === '';
}

export function prettyPrintList(arr: Array<string>): string {
    return arr.reduce((result, item, index) => {
        result += item;

        if (index === arr.length - 2) {
            result += ' & ';
        } else if (index !== arr.length - 1) {
            result += ', ';
        }

        return result;
    }, '');
}

export function formatDuration(duration: string): string {
    return Duration.fromISO(duration).toFormat('h:mm:ss');
}
