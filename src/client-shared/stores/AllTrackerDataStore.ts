import { AllBids, AllPrizes, Milestones } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const milestones = nodecg.Replicant<Milestones>('milestones');
const allBids = nodecg.Replicant<AllBids>('allBids');
const allPrizes = nodecg.Replicant<AllPrizes>('allPrizes');

interface AllTrackerDataStore {
    milestones: Milestones
    allBids: AllBids
    allPrizes: AllPrizes
}

export const useAllTrackerDataStore = defineStore('allTrackerData', {
    state: () => ({
        milestones: null,
        allBids: null,
        allPrizes: null
    } as unknown as AllTrackerDataStore)
});

export const initAllTrackerDataStore = createReplicantStoreInitializer([milestones, allPrizes, allBids], useAllTrackerDataStore);
