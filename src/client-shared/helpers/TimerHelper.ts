import { Duration } from 'types/schemas';
import { padNumber } from 'client-shared/helpers/StringHelper';

export function formatTimer(timer: Duration, trimHours = false): string {
    if (timer.hours === 0 && trimHours) {
        return `${padNumber(timer.minutes)}:${padNumber(timer.seconds)}.${String(Math.round(timer.milliseconds)).padStart(3, '0')[0]}`;
    } else {
        return `${timer.hours}:${padNumber(timer.minutes)}:${padNumber(timer.seconds)}.${String(Math.round(timer.milliseconds)).padStart(3, '0')[0]}`;
    }
}
