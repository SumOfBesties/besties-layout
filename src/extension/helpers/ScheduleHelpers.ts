import { ActiveSpeedrun, type OtherScheduleItem, Schedule, Speedrun } from 'types/schemas';
import { ScheduleItem } from 'types/ScheduleHelpers';

export function findActiveScheduleItem(schedule: Schedule['items'], activeSpeedrun?: string | null | Speedrun): ScheduleItem | null {
    if (activeSpeedrun == null) return null;
    const activeSpeedrunId = typeof activeSpeedrun === 'string' ? activeSpeedrun : activeSpeedrun?.id;
    const uncompletedInterstitialsBeforeActiveRun = findInterstitialsBefore(schedule, activeSpeedrunId)
        .filter(interstitial => !interstitial.completed);
    if (uncompletedInterstitialsBeforeActiveRun.length > 0) {
        return uncompletedInterstitialsBeforeActiveRun[0];
    } else {
        return (typeof activeSpeedrun === 'string' ? schedule.find(scheduleItem => scheduleItem.id === activeSpeedrunId) : activeSpeedrun) ?? null;
    }
}

export function findInterstitialsBefore(schedule: Schedule['items'], scheduleItemId: string | undefined | null) {
    if (scheduleItemId == null) return [];
    const scheduleItemIndex = schedule.findIndex(scheduleItem => scheduleItem.id === scheduleItemId);
    if (scheduleItemIndex === -1) return [];
    const result: OtherScheduleItem[] = [];
    for (let i = scheduleItemIndex - 1; i >= 0; i--) {
        const scheduleItem = schedule[i];
        if (scheduleItem.type === 'SPEEDRUN') break;
        result.push(scheduleItem);
    }
    return result.reverse();
}
