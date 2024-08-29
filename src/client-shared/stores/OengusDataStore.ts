import { OengusData } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const oengusData = nodecg.Replicant<OengusData>('oengusData');

interface OengusDataStore {
    oengusData: OengusData
}

export const useOengusDataStore = defineStore('oengusData', {
    state: () => ({
        oengusData: null
    } as unknown as OengusDataStore)
});

export const initOengusDataStore = createReplicantStoreInitializer([oengusData], useOengusDataStore);
