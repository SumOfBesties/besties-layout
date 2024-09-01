import { TwitchCommercialState, TwitchData } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const twitchData = nodecg.Replicant<TwitchData>('twitchData');
const twitchCommercialState = nodecg.Replicant<TwitchCommercialState>('twitchCommercialState');

interface TwitchDataStore {
    twitchData: TwitchData
    twitchCommercialState: TwitchCommercialState
}

export const useTwitchDataStore = defineStore('twitchData', {
    state: () => ({
        twitchData: null,
        twitchCommercialState: null
    } as unknown as TwitchDataStore),
    actions: {
        setSyncEnabled(newValue: boolean) {
            if (twitchData.value) {
                twitchData.value.syncEnabled = newValue;
            }
        }
    }
});

export const initTwitchDataStore = createReplicantStoreInitializer([twitchData, twitchCommercialState], useTwitchDataStore);
