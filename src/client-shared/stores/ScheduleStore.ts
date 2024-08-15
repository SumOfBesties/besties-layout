import { ActiveSpeedrun, NextSpeedrun, PlayerNameplateAssignments, Schedule } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const schedule = nodecg.Replicant<Schedule>('schedule');
const activeSpeedrun = nodecg.Replicant<ActiveSpeedrun>('activeSpeedrun');
const nextSpeedrun = nodecg.Replicant<NextSpeedrun>('nextSpeedrun');
const playerNameplateAssignments = nodecg.Replicant<PlayerNameplateAssignments>('playerNameplateAssignments');

interface ScheduleStore {
    schedule: Schedule
    activeSpeedrun: ActiveSpeedrun
    nextSpeedrun: NextSpeedrun
    playerNameplateAssignments: PlayerNameplateAssignments
}

export const useScheduleStore = defineStore('schedule', {
    state: () => ({
        schedule: null,
        activeSpeedrun: null,
        nextSpeedrun: null,
        playerNameplateAssignments: null
    } as unknown as ScheduleStore),
    getters: {
        activeSpeedrunIndex: state => state.activeSpeedrun == null ? -1 : state.schedule.items.findIndex(scheduleItem => scheduleItem.id === state.activeSpeedrun!.id),
        speedrunCount: state => (currentScheduleItemId?: string) => {
            const speedruns = state.schedule.items.filter(scheduleItem => scheduleItem.type === 'SPEEDRUN');
            return {
                total: speedruns.length,
                current: currentScheduleItemId == null ? -1 : (speedruns.findIndex(speedrun => speedrun.id === currentScheduleItemId) + 1)
            };
        }
    }
});

export const initScheduleStore = createReplicantStoreInitializer([
    schedule,
    activeSpeedrun,
    nextSpeedrun,
    playerNameplateAssignments
], useScheduleStore);
