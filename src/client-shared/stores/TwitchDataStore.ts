import { TwitchData } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const twitchData = nodecg.Replicant<TwitchData>('twitchData');

interface TwitchDataStore {
    twitchData: TwitchData
}

export const useTwitchDataStore = defineStore('twitchData', {
    state: () => ({
        twitchData: null
    } as unknown as TwitchDataStore)
});

export const initTwitchDataStore = createReplicantStoreInitializer([twitchData], useTwitchDataStore);
