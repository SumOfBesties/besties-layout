import { ActiveSpeedrun, NextSpeedrun, Schedule } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const schedule = nodecg.Replicant<Schedule>('schedule');
const activeSpeedrun = nodecg.Replicant<ActiveSpeedrun>('activeSpeedrun');
const nextSpeedrun = nodecg.Replicant<NextSpeedrun>('nextSpeedrun');

interface ScheduleStore {
    schedule: Schedule
    activeSpeedrun: ActiveSpeedrun
    nextSpeedrun: NextSpeedrun
}

export const useScheduleStore = defineStore('schedule', {
    state: () => ({
        schedule: null,
        activeSpeedrun: null,
        nextSpeedrun: null
    } as unknown as ScheduleStore),
    getters: {
        activeSpeedrunIndex: state => state.activeSpeedrun == null ? -1 : state.schedule.items.findIndex(scheduleItem => scheduleItem.id === state.activeSpeedrun!.id)
    }
});

export const initScheduleStore = createReplicantStoreInitializer([schedule, activeSpeedrun, nextSpeedrun], useScheduleStore);
