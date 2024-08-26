import { MixerState } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const mixerState = nodecg.Replicant<MixerState>('mixerState');

interface MixerStore {
    mixerState: MixerState
}

export const useMixerStore = defineStore('mixer', {
    state: () => ({
        mixerState: null
    } as unknown as MixerStore)
});

export const initMixerStore = createReplicantStoreInitializer([mixerState], useMixerStore);
