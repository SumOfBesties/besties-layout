import { ScheduleImportStatus, TrackerState } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const scheduleImportStatus = nodecg.Replicant<ScheduleImportStatus>('scheduleImportStatus', { persistent: false });
const trackerState = nodecg.Replicant<TrackerState>('trackerState', { persistent: false });

interface InternalStatusStore {
    scheduleImportStatus: ScheduleImportStatus
    trackerState: TrackerState
}

export const useInternalStatusStore = defineStore('internalStatus', {
    state: () => ({
        scheduleImportStatus: null,
        trackerState: null
    } as unknown as InternalStatusStore)
});

export const initInternalStatusStore = createReplicantStoreInitializer([scheduleImportStatus, trackerState], useInternalStatusStore);
