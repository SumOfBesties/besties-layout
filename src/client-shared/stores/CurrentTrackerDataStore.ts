import { CurrentBids, CurrentPrizes, Milestones } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const milestones = nodecg.Replicant<Milestones>('milestones');
const currentBids = nodecg.Replicant<CurrentBids>('currentBids');
const currentPrizes = nodecg.Replicant<CurrentPrizes>('currentPrizes');

interface CurrentTrackerDataStore {
    milestones: Milestones
    currentBids: CurrentBids
    currentPrizes: CurrentPrizes
}

export const useCurrentTrackerDataStore = defineStore('currentTrackerData', {
    state: () => ({
        milestones: null,
        currentBids: null,
        currentPrizes: null
    } as unknown as CurrentTrackerDataStore)
});

export const initCurrentTrackerDataStore = createReplicantStoreInitializer([milestones, currentBids, currentPrizes], useCurrentTrackerDataStore);
