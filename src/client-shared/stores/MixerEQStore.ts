import { MixerEQLevels } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const mixerEQLevels = nodecg.Replicant<MixerEQLevels>('mixerEQLevels');

interface MixerEQStore {
    mixerEQLevels: MixerEQLevels
}

export const useMixerEQStore = defineStore('mixer-eq', {
    state: () => ({
        mixerEQLevels: null
    } as unknown as MixerEQStore)
});

export const initMixerEQStore = createReplicantStoreInitializer([mixerEQLevels], useMixerEQStore);
