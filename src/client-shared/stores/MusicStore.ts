import { MusicState } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const musicState = nodecg.Replicant<MusicState>('musicState');

interface MusicStore {
    musicState: MusicState
}

export const useMusicStore = defineStore('music', {
    state: () => ({
        musicState: null
    } as unknown as MusicStore)
});

export const initMusicStore = createReplicantStoreInitializer([musicState], useMusicStore);
