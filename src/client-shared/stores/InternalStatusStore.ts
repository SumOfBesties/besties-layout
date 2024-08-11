import { ScheduleImportStatus } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const scheduleImportStatus = nodecg.Replicant<ScheduleImportStatus>('scheduleImportStatus', { persistent: false });

interface InternalStatusStore {
    scheduleImportStatus: ScheduleImportStatus
}

export const useInternalStatusStore = defineStore('internalStatus', {
    state: () => ({
        scheduleImportStatus: null
    } as unknown as InternalStatusStore)
});

export const initInternalStatusStore = createReplicantStoreInitializer([scheduleImportStatus], useInternalStatusStore);
